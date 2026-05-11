from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.database import engine, Base
from app.routes import public, admin
from app.models import models  # noqa – ensures models are registered with Base
from app.db.seed import seed_db

# Resolve uploads dir relative to this file (backend/uploads/)
BASE_DIR = Path(__file__).resolve().parent.parent  # → backend/
UPLOAD_DIR = BASE_DIR / "uploads" / "photos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Create tables (use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BNI-TPL 2026 Registration API",
    description="Player registration system for Trichy Premier League 2026",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(public.router)
app.include_router(admin.router)

# Serve uploaded photos at /uploads/photos/<filename>
app.mount("/uploads", StaticFiles(directory=str(BASE_DIR / "uploads")), name="uploads")


@app.on_event("startup")
def on_startup():
    """Seed initial data on startup."""
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    return {"message": "BNI-TPL 2026 API is running 🏏"}
