"""add matches table

Revision ID: 003_add_matches
Revises: 002_add_photo_url
Create Date: 2026-05-11 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "003_add_matches"
down_revision = "002_add_photo_url"
branch_labels = None
depends_on = None

SCHEMA = "BNI_registration"


def upgrade() -> None:
    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("team1_name", sa.String(length=100), nullable=False),
        sa.Column("team2_name", sa.String(length=100), nullable=False),
        sa.Column("team1_score", sa.Integer(), nullable=True),
        sa.Column("team2_score", sa.Integer(), nullable=True),
        sa.Column("team1_overs", sa.Float(), nullable=True),
        sa.Column("team2_overs", sa.Float(), nullable=True),
        sa.Column("max_overs", sa.Float(), nullable=False, server_default="20"),
        sa.Column("winner", sa.String(length=20), nullable=True),
        sa.Column("match_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("stage", sa.String(length=20), nullable=False, server_default="league"),
        sa.Column("match_number", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema=SCHEMA,
    )
    op.create_index(op.f("ix_matches_id"), "matches", ["id"], unique=False, schema=SCHEMA)
    op.create_index("ix_matches_stage", "matches", ["stage"], unique=False, schema=SCHEMA)


def downgrade() -> None:
    op.drop_index("ix_matches_stage", table_name="matches", schema=SCHEMA)
    op.drop_index(op.f("ix_matches_id"), table_name="matches", schema=SCHEMA)
    op.drop_table("matches", schema=SCHEMA)
