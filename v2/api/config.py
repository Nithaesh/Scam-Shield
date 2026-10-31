"""Configuration settings for Scam Shield v2 API."""

from __future__ import annotations

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable overrides and sensible defaults."""

    # Project metadata
    APP_NAME: str = "Scam Shield API"
    VERSION: str = "2.0.0"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8501"

    # Rate limiting (slowapi)
    RATE_LIMIT_ANALYZE: str = "10/minute"
    RATE_LIMIT_COMMUNITY_REPORT: str = "5/hour"
    RATE_LIMIT_DEFAULT: str = "60/minute"

    # Input constraints & timeouts
    MAX_IMAGE_MB: int = 5
    MAX_TEXT_CHARS: int = 5000
    PIPELINE_TIMEOUT_S: float = 65.0
    STAGE_TIMEOUT_S: float = 40.0

    # Community Intelligence (Database)
    COMMUNITY_ENABLED: bool = False
    COMMUNITY_ESCALATION: bool = False
    DATABASE_URL: str = "sqlite:///./v2/scam_shield_v2.db"
    HASH_SALT: str = "scam_shield_v2_salt_change_in_production"

    # LLM Settings (read from environment, matching existing agents)
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    FORCE_FALLBACK: bool = False
    USE_MOCK_TOOLS: bool = True
    USE_CACHE: bool = True

    model_config = SettingsConfigDict(
        env_file=(".env", "v2/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Return ALLOWED_ORIGINS split into a clean list of URLs."""
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


# Global cached settings instance
settings = Settings()
