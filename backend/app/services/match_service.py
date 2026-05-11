"""
Match service — CRUD for matches and points table calculation.

Points system:
  Win  → 2 pts
  Loss → 0 pts
  NR   → 1 pt each

NRR formula (standard cricket):
  NRR = (total runs scored / total overs faced) - (total runs conceded / total overs bowled against)
"""
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Match, Team
from app.schemas.schemas import MatchCreate, MatchResultUpdate, TeamStanding


# ── Helpers ───────────────────────────────────────────────────────────

def _overs_to_balls(overs: float) -> int:
    """Convert 18.3 → 111 balls (18*6 + 3)."""
    full = int(overs)
    part = round((overs - full) * 10)   # balls in partial over
    return full * 6 + part


def _balls_to_overs(balls: int) -> float:
    return balls / 6.0


# ── Match CRUD ────────────────────────────────────────────────────────

def create_match(db: Session, data: MatchCreate) -> Match:
    if data.team1_name == data.team2_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A team cannot play against itself.",
        )
    for name in (data.team1_name, data.team2_name):
        if not db.query(Team).filter(Team.name == name).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team '{name}' does not exist.",
            )

    match = Match(
        team1_name=data.team1_name,
        team2_name=data.team2_name,
        match_date=data.match_date,
        stage=data.stage,
        match_number=data.match_number,
        max_overs=data.max_overs,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def update_match_result(db: Session, match_id: int, result: MatchResultUpdate) -> Match:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found.")

    match.team1_score = result.team1_score
    match.team2_score = result.team2_score
    match.team1_overs = result.team1_overs
    match.team2_overs = result.team2_overs
    match.winner = result.winner
    db.commit()
    db.refresh(match)
    return match


def delete_match(db: Session, match_id: int) -> None:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found.")
    db.delete(match)
    db.commit()


def get_all_matches(db: Session) -> List[Match]:
    return db.query(Match).order_by(Match.match_number.nullslast(), Match.created_at).all()


# ── Points Table ──────────────────────────────────────────────────────

def get_standings(db: Session, stage: str = "league") -> List[TeamStanding]:
    """
    Compute the points table for the given stage from completed match results.
    Only league-stage matches count toward the standings by default.
    """
    teams = db.query(Team).order_by(Team.name).all()
    matches = (
        db.query(Match)
        .filter(Match.stage == stage, Match.winner.isnot(None))
        .all()
    )

    # Initialise accumulators per team
    stats: dict[str, dict] = {
        t.name: {
            "played": 0, "won": 0, "lost": 0, "no_result": 0,
            "runs_scored": 0, "balls_faced": 0,
            "runs_conceded": 0, "balls_bowled": 0,
        }
        for t in teams
    }

    for m in matches:
        t1, t2 = m.team1_name, m.team2_name
        if t1 not in stats or t2 not in stats:
            continue  # skip if a team was deleted

        stats[t1]["played"] += 1
        stats[t2]["played"] += 1

        # Accumulate runs / overs for NRR
        if m.team1_score is not None and m.team1_overs:
            stats[t1]["runs_scored"] += m.team1_score
            stats[t1]["balls_faced"] += _overs_to_balls(m.team1_overs)
            stats[t2]["runs_conceded"] += m.team1_score
            stats[t2]["balls_bowled"] += _overs_to_balls(m.team1_overs)

        if m.team2_score is not None and m.team2_overs:
            stats[t2]["runs_scored"] += m.team2_score
            stats[t2]["balls_faced"] += _overs_to_balls(m.team2_overs)
            stats[t1]["runs_conceded"] += m.team2_score
            stats[t1]["balls_bowled"] += _overs_to_balls(m.team2_overs)

        # Win / loss / NR
        if m.winner == "team1":
            stats[t1]["won"] += 1
            stats[t2]["lost"] += 1
        elif m.winner == "team2":
            stats[t2]["won"] += 1
            stats[t1]["lost"] += 1
        else:  # no_result
            stats[t1]["no_result"] += 1
            stats[t2]["no_result"] += 1

    # Build standings list
    rows: List[TeamStanding] = []
    for team_name, s in stats.items():
        points = s["won"] * 2 + s["no_result"] * 1

        # NRR
        rr_for = (s["runs_scored"] / _balls_to_overs(s["balls_faced"])) if s["balls_faced"] > 0 else 0.0
        rr_against = (s["runs_conceded"] / _balls_to_overs(s["balls_bowled"])) if s["balls_bowled"] > 0 else 0.0
        nrr = round(rr_for - rr_against, 3)

        rows.append(TeamStanding(
            rank=0,  # assigned after sort
            team_name=team_name,
            played=s["played"],
            won=s["won"],
            lost=s["lost"],
            no_result=s["no_result"],
            points=points,
            nrr=nrr,
        ))

    # Sort: points desc → NRR desc → name asc
    rows.sort(key=lambda r: (-r.points, -r.nrr, r.team_name))
    for i, row in enumerate(rows, start=1):
        row.rank = i

    return rows
