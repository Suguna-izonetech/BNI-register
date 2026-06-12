"""rename TYCOON to VICTORY

Revision ID: 008_rename_tycoon
Revises: 2ad195a12582
Create Date: 2026-06-12

"""
from alembic import op
import sqlalchemy as sa

revision = '008_rename_tycoon'
down_revision = '007_chapter_guest_regs'
branch_labels = None
depends_on = None

SCHEMA = 'BNI_registration'


def upgrade() -> None:
    op.execute(
        f"""
        UPDATE "{SCHEMA}".teams
        SET name = 'VICTORY'
        WHERE LOWER(name) = 'tycoon'
        """
    )
    # Also rename in all registration tables to keep data consistent
    for table in ('player_registrations', 'one_to_one_registrations', 'family_registrations'):
        op.execute(
            f"""
            UPDATE "{SCHEMA}".{table}
            SET team_name = 'VICTORY'
            WHERE LOWER(team_name) = 'tycoon'
            """
        )


def downgrade() -> None:
    op.execute(
        f"""
        UPDATE "{SCHEMA}".teams
        SET name = 'TYCOON'
        WHERE name = 'VICTORY'
        """
    )
    for table in ('player_registrations', 'one_to_one_registrations', 'family_registrations'):
        op.execute(
            f"""
            UPDATE "{SCHEMA}".{table}
            SET team_name = 'TYCOON'
            WHERE team_name = 'VICTORY'
            """
        )
