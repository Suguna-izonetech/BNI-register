from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean, func
from app.db.database import Base, DB_SCHEMA

_schema = {"schema": DB_SCHEMA}


class Team(Base):
    __tablename__ = "teams"
    __table_args__ = _schema

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PlayerRegistration(Base):
    __tablename__ = "player_registrations"
    __table_args__ = _schema

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), nullable=False)
    player_name = Column(String(150), nullable=False)
    phone_number = Column(String(15), nullable=False)
    jersey_name = Column(String(100), nullable=False)
    jersey_number = Column(Integer, nullable=False)
    jersey_size = Column(String(10), nullable=False)
    lower_size = Column(String(10), nullable=False)
    photo_url = Column(String(500), nullable=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = _schema

    id = Column(Integer, primary_key=True, index=True)
    team1_name = Column(String(100), nullable=False)
    team2_name = Column(String(100), nullable=False)
    team1_score = Column(Integer, nullable=True)
    team2_score = Column(Integer, nullable=True)
    team1_overs = Column(Float, nullable=True)
    team2_overs = Column(Float, nullable=True)
    max_overs = Column(Float, nullable=False, default=20.0)
    winner = Column(String(20), nullable=True)
    match_date = Column(DateTime(timezone=True), nullable=True)
    stage = Column(String(20), nullable=False, default="league")
    match_number = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class NewsPost(Base):
    """News and blog posts managed by admin."""
    __tablename__ = "news_posts"
    __table_args__ = _schema

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(320), unique=True, nullable=False)
    category = Column(String(50), nullable=False, default="news")  # "news" | "blog"
    content = Column(Text, nullable=False)
    excerpt = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    author = Column(String(150), nullable=False, default="BNI-TPL Admin")
    is_published = Column(Boolean, nullable=False, default=True)
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AdminUser(Base):
    __tablename__ = "admin_users"
    __table_args__ = _schema

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
