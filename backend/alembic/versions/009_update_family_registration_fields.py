"""update family_registrations: replace business fields with member_name, spouse_kids_name, selected_game

Revision ID: 009_family_fields
Revises: 008_rename_tycoon
Create Date: 2026-06-17

"""
from alembic import op
import sqlalchemy as sa

revision = '009_family_fields'
down_revision = '008_rename_tycoon'
branch_labels = None
depends_on = None

SCHEMA = 'BNI_registration'
TABLE = f'"{SCHEMA}".family_registrations'


def upgrade() -> None:
    # Drop old columns
    op.drop_column('family_registrations', 'business_name', schema=SCHEMA)
    op.drop_column('family_registrations', 'business_category', schema=SCHEMA)

    # Add new columns
    op.add_column('family_registrations',
        sa.Column('member_name', sa.String(150), nullable=True),
        schema=SCHEMA,
    )
    op.add_column('family_registrations',
        sa.Column('spouse_kids_name', sa.String(150), nullable=True),
        schema=SCHEMA,
    )
    op.add_column('family_registrations',
        sa.Column('selected_game', sa.String(200), nullable=True),
        schema=SCHEMA,
    )


def downgrade() -> None:
    op.drop_column('family_registrations', 'member_name', schema=SCHEMA)
    op.drop_column('family_registrations', 'spouse_kids_name', schema=SCHEMA)
    op.drop_column('family_registrations', 'selected_game', schema=SCHEMA)

    op.add_column('family_registrations',
        sa.Column('business_name', sa.String(200), nullable=True),
        schema=SCHEMA,
    )
    op.add_column('family_registrations',
        sa.Column('business_category', sa.String(100), nullable=True),
        schema=SCHEMA,
    )
