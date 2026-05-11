"""add photo_url to player_registrations

Revision ID: 002_add_photo_url
Revises: 001_initial
Create Date: 2026-05-09 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "002_add_photo_url"
down_revision = "001_initial"
branch_labels = None
depends_on = None

SCHEMA = "BNI_registration"


def upgrade() -> None:
    op.add_column(
        "player_registrations",
        sa.Column("photo_url", sa.String(length=500), nullable=True),
        schema=SCHEMA,
    )


def downgrade() -> None:
    op.drop_column("player_registrations", "photo_url", schema=SCHEMA)
