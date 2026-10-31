"""Health check and telemetry endpoint."""

from __future__ import annotations

import os
import time
from fastapi import APIRouter
from v2.api.config import settings
from v2.api.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])

START_TIME = time.time()


@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Check system operational status and provider configurations."""
    # Check database status safely
    db_ok = True
    if settings.COMMUNITY_ENABLED:
        try:
            from sqlalchemy import text
            from v2.api.db.session import engine
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception:
            db_ok = False

    gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    groq_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY

    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        gemini_configured=bool(gemini_key and gemini_key.strip()),
        groq_configured=bool(groq_key and groq_key.strip()),
        db_ok=db_ok,
        uptime_s=round(time.time() - START_TIME, 2),
    )
