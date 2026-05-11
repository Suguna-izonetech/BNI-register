from logging.config import fileConfig
from sqlalchemy import create_engine, pool, text
from alembic import context
import os
import sys

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import Base, DB_SCHEMA
from app.models import models  # noqa – registers all models
from app.core.config import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    # Render URL as string for offline mode
    url = settings.DATABASE_URL.render_as_string(hide_password=False)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        version_table_schema=DB_SCHEMA,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Build engine directly from URL object — no string conversion needed
    connectable = create_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        # Ensure schema exists before running migrations
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{DB_SCHEMA}"'))
        connection.execute(text(f'SET search_path TO "{DB_SCHEMA}", public'))
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            version_table_schema=DB_SCHEMA,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
