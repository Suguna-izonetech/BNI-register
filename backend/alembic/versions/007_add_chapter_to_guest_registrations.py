"""Add chapter to guest registrations

Revision ID: 007_chapter_guest_regs
Revises: 2ad195a12582
Create Date: 2026-06-05
"""

from alembic import op
import sqlalchemy as sa
from app.core.config import settings


revision = "007_chapter_guest_regs"
down_revision = "2ad195a12582"
branch_labels = None
depends_on = None

SCHEMA = settings.DB_SCHEMA


def upgrade() -> None:
    op.add_column("one_to_one_registrations", sa.Column("team_name", sa.String(length=100), nullable=True), schema=SCHEMA)
    op.add_column("family_registrations", sa.Column("team_name", sa.String(length=100), nullable=True), schema=SCHEMA)


def downgrade() -> None:
    op.drop_column("family_registrations", "team_name", schema=SCHEMA)
    op.drop_column("one_to_one_registrations", "team_name", schema=SCHEMA)
