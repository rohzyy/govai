from pydantic import BaseSettings, AnyUrl, Field, validator
from typing import Optional
import os

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "GrievanceAI Enterprise"
    API_V1_STR: str = "/api"

    # Security Config - must be provided via environment in production
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 Hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Speech-to-Text & AI Config
    # NOTE: Do NOT commit real API keys. Set them as environment variables.
    STT_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Database (example)
    DATABASE_URL: Optional[AnyUrl] = Field(None, env="DATABASE_URL")

    # Cookie Settings for Production Security
    COOKIE_SETTINGS: dict = {
        "httponly": True,
        # Add other cookie flags when running under HTTPS
    }

    class Config:
        env_file = os.getenv("ENV_FILE", ".env")
        env_file_encoding = "utf-8"

    @validator("SECRET_KEY")
    def ensure_secret_key(cls, v):
        if not v or str(v).startswith("PERMANENT_DEV_"):
            raise ValueError("SECRET_KEY must be set in environment for production (do not use the dev placeholder)")
        return v

settings = Settings()