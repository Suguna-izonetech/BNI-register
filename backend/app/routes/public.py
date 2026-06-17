from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import HTMLResponse
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
from app.services.registration_service import create_one_to_one, create_family_registration
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
    photo: UploadFile = File(...),
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
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Player photo is required.",
        )

    create_registration(db, data, photo_url=photo_url)
    return {"message": "Registration successful! Welcome to BNI-TPL 2026."}



@router.post("/register/one-to-one", response_model=MessageResponse, status_code=201)
async def register_one_to_one(
        team_name: str = Form(...),
        name: str = Form(...),
        phone_number: str = Form(...),
        business_name: str = Form(...),
        business_category: str = Form(...),
        photo: UploadFile = File(...),
        db: Session = Depends(get_db),
):
        from app.schemas.schemas import OneToOneRegistrationCreate

        data = OneToOneRegistrationCreate(team_name=team_name, name=name, phone_number=phone_number, business_name=business_name, business_category=business_category)
        photo_url: Optional[str] = None
        if photo and photo.filename:
                photo_url = await save_photo(photo)
        else:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Photo is required for one-to-one registration.")

        reg = create_one_to_one(db, data, photo_url=photo_url)
        return {"message": f"One-to-one registration successful. Admit card: /admit/one-to-one/{reg.id}"}


@router.post("/register/family", response_model=MessageResponse, status_code=201)
async def register_family(
        team_name: str = Form(...),
        name: str = Form(...),
        phone_number: str = Form(...),
        age_category: str = Form(...),
        member_name: str = Form(...),
        spouse_kids_name: str = Form(...),
        selected_game: str = Form(...),
        photo: UploadFile = File(...),
        db: Session = Depends(get_db),
):
        from app.schemas.schemas import FamilyRegistrationCreate

        data = FamilyRegistrationCreate(
            team_name=team_name,
            name=name,
            phone_number=phone_number,
            age_category=age_category,
            member_name=member_name,
            spouse_kids_name=spouse_kids_name,
            selected_game=selected_game,
        )
        photo_url: Optional[str] = None
        if photo and photo.filename:
                photo_url = await save_photo(photo)
        else:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Photo is required for family registration.")

        reg = create_family_registration(db, data, photo_url=photo_url)
        return {"message": f"Family registration successful. Admit card: /admit/family/{reg.id}"}



@router.get("/admit/one-to-one/{reg_id}", response_class=HTMLResponse)
def admit_one_to_one(reg_id: int, db: Session = Depends(get_db)):
        from app.models.models import OneToOneRegistration

        reg = db.query(OneToOneRegistration).filter(OneToOneRegistration.id == reg_id).first()
        if not reg:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

        photo_html = f'<img src="{reg.photo_url}" alt="photo" style="max-width:140px;border-radius:8px;" />' if reg.photo_url else ''
        html = f"""
        <html><body style="font-family: Arial, Helvetica, sans-serif; padding: 2rem;">
            <h2>BNI-TPL 2026 — Admit Card (One-to-One)</h2>
            <div style="display:flex;gap:2rem;align-items:center;margin-top:1rem;">
                <div>{photo_html}</div>
                <div>
                    <p><strong>Name:</strong> {reg.name}</p>
                    <p><strong>Chapter:</strong> {reg.team_name or '-'}</p>
                    <p><strong>Phone:</strong> {reg.phone_number}</p>
                    <p><strong>Business:</strong> {reg.business_name or '-'}</p>
                    <p><strong>Category:</strong> {reg.business_category or '-'}</p>
                </div>
            </div>
            <p style="margin-top:2rem;color:#666;">Present this admit card at registration desk.</p>
        </body></html>
        """
        return HTMLResponse(content=html)


@router.get("/admit/family/{reg_id}", response_class=HTMLResponse)
def admit_family(reg_id: int, db: Session = Depends(get_db)):
        from app.models.models import FamilyRegistration

        reg = db.query(FamilyRegistration).filter(FamilyRegistration.id == reg_id).first()
        if not reg:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")

        photo_html = f'<img src="{reg.photo_url}" alt="photo" style="max-width:140px;border-radius:8px;" />' if reg.photo_url else ''
        html = f"""
        <html><body style="font-family: Arial, Helvetica, sans-serif; padding: 2rem;">
            <h2>BNI-TPL 2026 — Admit Card (Family)</h2>
            <div style="display:flex;gap:2rem;align-items:center;margin-top:1rem;">
                <div>{photo_html}</div>
                <div>
                    <p><strong>Name:</strong> {reg.name}</p>
                    <p><strong>Chapter:</strong> {reg.team_name or '-'}</p>
                    <p><strong>Phone:</strong> {reg.phone_number}</p>
                    <p><strong>Age Category:</strong> {reg.age_category or '-'}</p>
                    <p><strong>Member Name:</strong> {reg.member_name or '-'}</p>
                    <p><strong>Spouse / Kids Name:</strong> {reg.spouse_kids_name or '-'}</p>
                    <p><strong>Selected Game:</strong> {reg.selected_game or '-'}</p>
                </div>
            </div>
            <p style="margin-top:2rem;color:#666;">Present this admit card at registration desk.</p>
        </body></html>
        """
        return HTMLResponse(content=html)
