"""make photo_url NOT NULL

Revision ID: 006
Revises: 005
Create Date: 2026-05-28
"""
from alembic import op
import sqlalchemy as sa
from app.core.config import settings

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None

SCHEMA = settings.DB_SCHEMA


def upgrade() -> None:
    # Fill any existing NULLs before applying NOT NULL constraint
    op.execute(
        f"UPDATE \"{SCHEMA}\".player_registrations "
        f"SET photo_url = 'Not Uploaded' WHERE photo_url IS NULL"
    )
    op.alter_column(
        'player_registrations',
        'photo_url',
        existing_type=sa.String(500),
        nullable=False,
        schema=SCHEMA,
    )


def downgrade() -> None:
    op.alter_column(
        'player_registrations',
        'photo_url',
        existing_type=sa.String(500),
        nullable=True,
        schema=SCHEMA,
    )
