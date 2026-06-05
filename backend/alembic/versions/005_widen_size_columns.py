"""widen jersey_size and lower_size columns to String(10)

Revision ID: 005
Revises: 004
Create Date: 2026-05-28
"""
from alembic import op
import sqlalchemy as sa
from app.core.config import settings

# revision identifiers
revision = '005'
down_revision = '004_add_news_posts'
branch_labels = None
depends_on = None

SCHEMA = settings.DB_SCHEMA


def upgrade() -> None:
    op.alter_column(
        'player_registrations',
        'jersey_size',
        existing_type=sa.String(5),
        type_=sa.String(10),
        schema=SCHEMA,
    )
    op.alter_column(
        'player_registrations',
        'lower_size',
        existing_type=sa.String(5),
        type_=sa.String(10),
        schema=SCHEMA,
    )


def downgrade() -> None:
    op.alter_column(
        'player_registrations',
        'jersey_size',
        existing_type=sa.String(10),
        type_=sa.String(5),
        schema=SCHEMA,
    )
    op.alter_column(
        'player_registrations',
        'lower_size',
        existing_type=sa.String(10),
        type_=sa.String(5),
        schema=SCHEMA,
    )
