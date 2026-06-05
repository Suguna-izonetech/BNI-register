from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

DB_SCHEMA = settings.DB_SCHEMA  # "BNI_registration" from .env

engine = create_engine(settings.DATABASE_URL)

# Ensure the schema exists on startup
with engine.connect() as conn:
    conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{DB_SCHEMA}"'))
    conn.commit()

# Set search_path for every new connection
@event.listens_for(engine, "connect")
def set_search_path(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute(f'SET search_path TO "{DB_SCHEMA}", public')
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base() # all models default to this schema


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
