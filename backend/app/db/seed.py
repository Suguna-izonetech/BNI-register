from sqlalchemy.orm import Session
from app.models.models import Team
from app.db.database import SessionLocal
# All 20 teams from the UI screenshots
TEAMS = [
    "Azpire", "Benchmark", "Champions", "Dynamic", "EMPEROR",
    "FORTUNE", "GLADIATORS", "HARMONY", "ICONS", "JAAGUAR",
    "KINGS", "Legends", "Millionaire", "Nest", "PRINCE",
    "SPARK", "OSCAR", "TYCOON", "ROYALS", "WARRIORS",
]


def seed_db(db: Session):
    """Insert teams if they don't exist."""
    existing = {t.name for t in db.query(Team).all()}
    for name in TEAMS:
        if name not in existing:
            db.add(Team(name=name))
    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_db(db)
        print("Seeding complete.")
    finally:
        db.close()
