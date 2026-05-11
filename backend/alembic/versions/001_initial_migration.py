"""initial migration

Revision ID: 001_initial
Revises:
Create Date: 2026-05-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None

SCHEMA = "BNI_registration"


def upgrade() -> None:
    op.create_table(
        "teams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        schema=SCHEMA,
    )
    op.create_index(op.f("ix_teams_id"), "teams", ["id"], unique=False, schema=SCHEMA)

    op.create_table(
        "player_registrations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("team_name", sa.String(length=100), nullable=False),
        sa.Column("player_name", sa.String(length=150), nullable=False),
        sa.Column("phone_number", sa.String(length=15), nullable=False),
        sa.Column("jersey_name", sa.String(length=100), nullable=False),
        sa.Column("jersey_number", sa.Integer(), nullable=False),
        sa.Column("jersey_size", sa.String(length=5), nullable=False),
        sa.Column("lower_size", sa.String(length=5), nullable=False),
        sa.Column("registered_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema=SCHEMA,
    )
    op.create_index(op.f("ix_player_registrations_id"), "player_registrations", ["id"], unique=False, schema=SCHEMA)

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
        schema=SCHEMA,
    )
    op.create_index(op.f("ix_admin_users_id"), "admin_users", ["id"], unique=False, schema=SCHEMA)


def downgrade() -> None:
    op.drop_index(op.f("ix_admin_users_id"), table_name="admin_users", schema=SCHEMA)
    op.drop_table("admin_users", schema=SCHEMA)
    op.drop_index(op.f("ix_player_registrations_id"), table_name="player_registrations", schema=SCHEMA)
    op.drop_table("player_registrations", schema=SCHEMA)
    op.drop_index(op.f("ix_teams_id"), table_name="teams", schema=SCHEMA)
    op.drop_table("teams", schema=SCHEMA)
