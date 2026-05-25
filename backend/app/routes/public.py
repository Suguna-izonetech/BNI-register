from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.schemas import (
    MessageResponse,
    PlayerRegistrationCreate,
    TeamResponse,
    MatchResponse,
    TeamStanding,
    NewsPostResponse,
)
from app.services.registration_service import create_registration, get_all_teams, save_photo
from app.services.match_service import get_all_matches, get_standings
from app.services.news_service import get_all_posts, get_post_by_slug

router = APIRouter(tags=["Public"])


@router.get("/teams", response_model=List[TeamResponse])
def list_teams(db: Session = Depends(get_db)):
    return get_all_teams(db)


@router.get("/matches", response_model=List[MatchResponse])
def list_matches(db: Session = Depends(get_db)):
    return get_all_matches(db)


@router.get("/standings", response_model=List[TeamStanding])
def points_table(stage: str = "league", db: Session = Depends(get_db)):
    return get_standings(db, stage=stage)


# ── News / Blog public endpoints ──────────────────────────────────────

@router.get("/news", response_model=List[NewsPostResponse])
def list_news(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch published posts. Pass ?category=news or ?category=blog to filter."""
    return get_all_posts(db, category=category, published_only=True)


@router.get("/news/{slug}", response_model=NewsPostResponse)
def get_news_post(slug: str, db: Session = Depends(get_db)):
    """Fetch a single published post by slug."""
    return get_post_by_slug(db, slug)


@router.post("/register", response_model=MessageResponse, status_code=201)
async def register_player(
    team_name: str = Form(...),
    player_name: str = Form(...),
    phone_number: str = Form(...),
    jersey_name: str = Form(...),
    jersey_number: int = Form(...),
    jersey_size: str = Form(...),
    lower_size: str = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Submit a player registration form (multipart/form-data)."""
    data = PlayerRegistrationCreate(
        team_name=team_name,
        player_name=player_name,
        phone_number=phone_number,
        jersey_name=jersey_name,
        jersey_number=jersey_number,
        jersey_size=jersey_size,
        lower_size=lower_size,
    )

    photo_url: Optional[str] = None
    if photo and photo.filename:
        photo_url = await save_photo(photo)

    create_registration(db, data, photo_url=photo_url)
    return {"message": "Registration successful! Welcome to BNI-TPL 2026."}
