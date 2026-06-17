import re
from typing import List, Optional
from pydantic import BaseModel, field_validator
from datetime import datetime


# ── Team Schemas ────────────────────────────────────────────────────
class TeamCreate(BaseModel):
    name: str


class TeamResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# ── Registration Schemas ─────────────────────────────────────────────
JERSEY_SIZES = ["38", "40", "42", "44", "46", "48"]


class PlayerRegistrationCreate(BaseModel):
    team_name: str
    player_name: str
    phone_number: str
    jersey_name: str
    jersey_number: int
    jersey_size: str
    lower_size: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Strip +91 prefix if present
        cleaned = v.strip()
        if cleaned.startswith("+91"):
            cleaned = cleaned[3:].strip()
        elif cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not re.fullmatch(r"[6-9]\d{9}", cleaned):
            raise ValueError(
                "Phone number must be a valid Indian mobile number (10 digits starting with 6-9)"
            )
        return f"+91{cleaned}"

    @field_validator("jersey_size", "lower_size")
    @classmethod
    def validate_size(cls, v: str) -> str:
        if v not in JERSEY_SIZES:
            raise ValueError(f"Size must be one of {JERSEY_SIZES}")
        return v

    @field_validator("player_name", "jersey_name", "team_name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("jersey_number")
    @classmethod
    def validate_jersey_number(cls, v: int) -> int:
        if v < 0 or v > 999:
            raise ValueError("Jersey number must be between 0 and 999")
        return v


class PlayerRegistrationResponse(BaseModel):
    id: int
    team_name: str
    player_name: str
    phone_number: str
    jersey_name: str
    jersey_number: int
    jersey_size: str
    lower_size: str
    photo_url: Optional[str] = None
    registered_at: datetime

    class Config:
        from_attributes = True


# ── Auth Schemas ─────────────────────────────────────────────────────
class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class MessageResponse(BaseModel):
    message: str


# ── One-to-One / Family Registration Schemas ─────────────────────


class OneToOneRegistrationCreate(BaseModel):
    team_name: str
    name: str
    phone_number: str
    business_name: str
    business_category: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if cleaned.startswith("+91"):
            cleaned = cleaned[3:].strip()
        elif cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not re.fullmatch(r"[6-9]\d{9}", cleaned):
            raise ValueError(
                "Phone number must be a valid Indian mobile number (10 digits starting with 6-9)"
            )
        return f"+91{cleaned}"

    @field_validator("team_name", "name", "business_name", "business_category")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class OneToOneRegistrationResponse(BaseModel):
    id: int
    team_name: Optional[str] = None
    name: str
    phone_number: str
    business_name: Optional[str] = None
    business_category: Optional[str] = None
    photo_url: Optional[str] = None
    registered_at: datetime

    class Config:
        from_attributes = True


class FamilyRegistrationCreate(BaseModel):
    team_name: str
    name: str
    phone_number: str
    age_category: str
    member_name: str
    spouse_kids_name: str
    selected_game: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if cleaned.startswith("+91"):
            cleaned = cleaned[3:].strip()
        elif cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not re.fullmatch(r"[6-9]\d{9}", cleaned):
            raise ValueError(
                "Phone number must be a valid Indian mobile number (10 digits starting with 6-9)"
            )
        return f"+91{cleaned}"

    @field_validator("team_name", "name", "age_category", "member_name", "spouse_kids_name", "selected_game")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class FamilyRegistrationResponse(BaseModel):
    id: int
    team_name: Optional[str] = None
    name: str
    phone_number: str
    age_category: Optional[str] = None
    member_name: Optional[str] = None
    spouse_kids_name: Optional[str] = None
    selected_game: Optional[str] = None
    photo_url: Optional[str] = None
    registered_at: datetime

    class Config:
        from_attributes = True


# ── Match Schemas ─────────────────────────────────────────────────────

MATCH_STAGES = ["league", "quarter_final", "semi_final", "final"]
WINNER_VALUES = ["team1", "team2", "no_result"]


class MatchCreate(BaseModel):
    team1_name: str
    team2_name: str
    match_date: Optional[datetime] = None
    stage: str = "league"
    match_number: Optional[int] = None
    max_overs: float = 20.0

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        if v not in MATCH_STAGES:
            raise ValueError(f"stage must be one of {MATCH_STAGES}")
        return v

    @field_validator("team1_name", "team2_name")
    @classmethod
    def teams_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Team name cannot be empty")
        return v.strip()


class MatchResultUpdate(BaseModel):
    """Payload to record the result of a played match."""
    team1_score: int
    team2_score: int
    team1_overs: float   # actual overs faced (e.g. 18.3 = 18 overs 3 balls)
    team2_overs: float
    winner: str          # "team1" | "team2" | "no_result"

    @field_validator("winner")
    @classmethod
    def validate_winner(cls, v: str) -> str:
        if v not in WINNER_VALUES:
            raise ValueError(f"winner must be one of {WINNER_VALUES}")
        return v

    @field_validator("team1_score", "team2_score")
    @classmethod
    def non_negative_score(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Score cannot be negative")
        return v

    @field_validator("team1_overs", "team2_overs")
    @classmethod
    def valid_overs(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Overs must be greater than 0")
        return v


class MatchResponse(BaseModel):
    id: int
    team1_name: str
    team2_name: str
    team1_score: Optional[int] = None
    team2_score: Optional[int] = None
    team1_overs: Optional[float] = None
    team2_overs: Optional[float] = None
    max_overs: float
    winner: Optional[str] = None
    match_date: Optional[datetime] = None
    stage: str
    match_number: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Points Table Schema ───────────────────────────────────────────────

class TeamStanding(BaseModel):
    """Computed standing for a single team — derived from match results."""
    rank: int
    team_name: str
    played: int
    won: int
    lost: int
    no_result: int
    points: int
    nrr: float   # Net Run Rate

# ── News / Blog Schemas ───────────────────────────────────────────────

NEWS_CATEGORIES = ["news", "blog"]


class NewsPostCreate(BaseModel):
    title: str
    category: str = "news"
    content: str
    excerpt: Optional[str] = None
    author: str = "BNI-TPL Admin"
    is_published: bool = True

    @field_validator("title", "content")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("category")
    @classmethod
    def valid_category(cls, v: str) -> str:
        if v not in NEWS_CATEGORIES:
            raise ValueError(f"category must be one of {NEWS_CATEGORIES}")
        return v


class NewsPostUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    author: Optional[str] = None
    is_published: Optional[bool] = None


class NewsPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    content: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    author: str
    is_published: bool
    published_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
