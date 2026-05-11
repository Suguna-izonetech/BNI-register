from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.db.database import get_db
from app.schemas.schemas import (
    AdminLogin, Token,
    PlayerRegistrationResponse,
    MatchCreate, MatchResultUpdate, MatchResponse,
)
from app.core.security import create_access_token, get_current_admin
from app.core.config import settings
from app.services.registration_service import get_all_registrations, export_registrations_excel
from app.services.match_service import (
    create_match, update_match_result, delete_match, get_all_matches,
)
from typing import List

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
