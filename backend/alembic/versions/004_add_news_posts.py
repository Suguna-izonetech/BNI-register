"""add news_posts table

Revision ID: 004_add_news_posts
Revises: 003_add_matches
Create Date: 2026-05-16 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "004_add_news_posts"
down_revision = "003_add_matches"
branch_labels = None
depends_on = None

SCHEMA = "BNI_registration"


def upgrade() -> None:
    op.create_table(
        "news_posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("slug", sa.String(length=320), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="news"),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("excerpt", sa.String(length=500), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("author", sa.String(length=150), nullable=False, server_default="BNI-TPL Admin"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("published_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        schema=SCHEMA,
    )
    op.create_index(op.f("ix_news_posts_id"), "news_posts", ["id"], unique=False, schema=SCHEMA)
    op.create_index("ix_news_posts_category", "news_posts", ["category"], unique=False, schema=SCHEMA)
    op.create_index("ix_news_posts_published", "news_posts", ["is_published"], unique=False, schema=SCHEMA)


def downgrade() -> None:
    op.drop_index("ix_news_posts_published", table_name="news_posts", schema=SCHEMA)
    op.drop_index("ix_news_posts_category", table_name="news_posts", schema=SCHEMA)
    op.drop_index(op.f("ix_news_posts_id"), table_name="news_posts", schema=SCHEMA)
    op.drop_table("news_posts", schema=SCHEMA)
