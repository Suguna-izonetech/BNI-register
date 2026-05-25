import io
import uuid
import pandas as pd
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.models import PlayerRegistration, Team
from app.schemas.schemas import PlayerRegistrationCreate

# Resolve uploads relative to this file so it always lands inside backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # → backend/
UPLOAD_DIR = BASE_DIR / "uploads" / "photos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB hard limit (compression happens on frontend)


def get_all_teams(db: Session):
    return db.query(Team).order_by(Team.name).all()


async def save_photo(photo: UploadFile) -> str:
    """Validate and persist the uploaded photo; return its relative URL path."""
    if photo.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Photo must be a JPEG, PNG, or WebP image.",
        )

    contents = await photo.read()

    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Photo exceeds the 5 MB size limit. Please compress it before uploading.",
        )

    ext = photo.filename.rsplit(".", 1)[-1].lower() if "." in photo.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = UPLOAD_DIR / filename

    with open(dest, "wb") as f:
        f.write(contents)

    return f"/uploads/photos/{filename}"


def create_registration(
    db: Session,
    data: PlayerRegistrationCreate,
    photo_url: Optional[str] = None,
) -> PlayerRegistration:
    # Check if team exists
    team = db.query(Team).filter(Team.name == data.team_name).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Team '{data.team_name}' does not exist",
        )

    registration = PlayerRegistration(
        team_name=data.team_name,
        player_name=data.player_name,
        phone_number=data.phone_number,
        jersey_name=data.jersey_name,
        jersey_number=data.jersey_number,
        jersey_size=data.jersey_size,
        lower_size=data.lower_size,
        photo_url=photo_url,
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


def get_all_registrations(db: Session):
    return db.query(PlayerRegistration).order_by(PlayerRegistration.registered_at.desc()).all()


def export_registrations_excel(db: Session) -> bytes:
    registrations = get_all_registrations(db)
    data = [
        {
            "Team Name": r.team_name,
            "Player Name": r.player_name,
            "Phone Number": r.phone_number,
            "Jersey Name": r.jersey_name,
            "Jersey Number": r.jersey_number,
            "Jersey Size": r.jersey_size,
            "Lower Size": r.lower_size,
            "Photo": r.photo_url if r.photo_url else "Not Uploaded",
            "Registered At": r.registered_at.strftime("%Y-%m-%d %H:%M:%S") if r.registered_at else "",
        }
        for r in registrations
    ]
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Registrations")
        worksheet = writer.sheets["Registrations"]
        for col in worksheet.columns:
            max_len = max((len(str(cell.value or "")) for cell in col), default=10)
            worksheet.column_dimensions[col[0].column_letter].width = min(max_len + 4, 40)
    return output.getvalue()
