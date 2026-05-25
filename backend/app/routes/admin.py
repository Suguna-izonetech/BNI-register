from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io

from app.db.database import get_db
from app.schemas.schemas import (
    AdminLogin, Token,
    PlayerRegistrationResponse,
    MatchCreate, MatchResultUpdate, MatchResponse,
    NewsPostCreate, NewsPostUpdate, NewsPostResponse,
)
from app.core.security import create_access_token, get_current_admin
from app.core.config import settings
from app.services.registration_service import get_all_registrations, export_registrations_excel
from app.services.match_service import (
    create_match, update_match_result, delete_match, get_all_matches,
)
from app.services.news_service import (
    create_post, get_all_posts, get_post_by_id,
    update_post, delete_post, save_news_image,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login", response_model=Token)
def admin_login(credentials: AdminLogin):
    """Admin login - returns JWT token."""
    if credentials.username != settings.ADMIN_USERNAME:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if credentials.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(data={"sub": credentials.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/registrations", response_model=List[PlayerRegistrationResponse])
def list_registrations(
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Fetch all player registrations (admin only)."""
    return get_all_registrations(db)


@router.get("/export")
def export_excel(
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Export all registrations as Excel (admin only)."""
    excel_bytes = export_registrations_excel(db)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=BNI_TPL_2026_Registrations.xlsx"},
    )


# ── Match Management ──────────────────────────────────────────────────

@router.get("/matches", response_model=List[MatchResponse])
def list_matches(
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """List all scheduled/completed matches."""
    return get_all_matches(db)


@router.post("/matches", response_model=MatchResponse, status_code=201)
def add_match(
    data: MatchCreate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Schedule a new match."""
    return create_match(db, data)


@router.put("/matches/{match_id}/result", response_model=MatchResponse)
def record_result(
    match_id: int,
    result: MatchResultUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Record or update the result of a match."""
    return update_match_result(db, match_id, result)


@router.delete("/matches/{match_id}", status_code=204)
def remove_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Delete a match."""
    delete_match(db, match_id)


# ── News / Blog Management ────────────────────────────────────────────

@router.get("/news", response_model=List[NewsPostResponse])
def admin_list_news(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """List all posts (including unpublished)."""
    return get_all_posts(db, category=category, published_only=False)


@router.post("/news", response_model=NewsPostResponse, status_code=201)
async def admin_create_news(
    title: str = Form(...),
    category: str = Form("news"),
    content: str = Form(...),
    excerpt: Optional[str] = Form(None),
    author: str = Form("BNI-TPL Admin"),
    is_published: bool = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Create a news/blog post with optional cover image."""
    data = NewsPostCreate(
        title=title,
        category=category,
        content=content,
        excerpt=excerpt,
        author=author,
        is_published=is_published,
    )
    image_url: Optional[str] = None
    if image and image.filename:
        image_url = await save_news_image(image)
    return create_post(db, data, image_url=image_url)


@router.put("/news/{post_id}", response_model=NewsPostResponse)
async def admin_update_news(
    post_id: int,
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    excerpt: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Update a post. Only provided fields are changed."""
    data = NewsPostUpdate(
        title=title,
        category=category,
        content=content,
        excerpt=excerpt,
        author=author,
        is_published=is_published,
    )
    image_url: Optional[str] = None
    if image and image.filename:
        image_url = await save_news_image(image)
    return update_post(db, post_id, data, image_url=image_url)


@router.delete("/news/{post_id}", status_code=204)
def admin_delete_news(
    post_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    """Delete a post."""
    delete_post(db, post_id)
