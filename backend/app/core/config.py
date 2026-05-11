from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,   # DB_HOST in .env matches DB_HOST field
        extra="ignore",         # ignore any unrecognised .env keys
    )

    # ── Database ───────────────────────────────────────────────────────────
    DB_HOST: str = "72.62.198.6"
    DB_PORT: int = 5432
    DB_NAME: str = "izone_db"
    DB_USER: str = "data_admin"
    DB_PASSWORD: str = "qqssxx&234#Tc"
    DB_SCHEMA: str = "BNI_registration"

    # ── App ────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_RELOAD: bool = True

    # ── Auth ───────────────────────────────────────────────────────────────
    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "Admin@BNI2026"

    @property
    def DATABASE_URL(self) -> URL:
        """
        SQLAlchemy URL.create() accepts the password as a plain string —
        no manual URL-encoding needed, special chars (&, #, %) are safe.
        """
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME,
        )


settings = Settings()
