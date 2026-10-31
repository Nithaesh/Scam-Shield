"""Community fraud intelligence registry endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from v2.api.config import settings
from v2.api.db.session import get_db
from v2.api.db.repository import CommunityRepository
from v2.api.models.schemas import (
    CommunityLookupRequest,
    CommunityLookupResponse,
    CommunityReportRequest,
    CommunityStatsResponse,
)
from v2.api.middleware.rate_limit import limiter

router = APIRouter(prefix="/community", tags=["Community"])


@router.post("/report", status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_COMMUNITY_REPORT)
async def report_fraud_entity(
    request: Request,
    payload: CommunityReportRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Submit a community scam report for an entity (stores only one-way cryptographic hash)."""
    if not settings.COMMUNITY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community intelligence feature is currently disabled.",
        )

    val = payload.value.strip()
    if not val:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Entity value cannot be empty.")

    repo = CommunityRepository(db)
    repo.report_entity(
        entity_type=payload.entity_type,
        raw_value=val,
        scam_type=payload.scam_type,
    )

    return {"status": "reported", "message": "Threat report securely recorded in citizen fraud registry."}


@router.post("/lookup", response_model=CommunityLookupResponse)
async def lookup_fraud_entities(
    payload: CommunityLookupRequest,
    db: Session = Depends(get_db),
) -> CommunityLookupResponse:
    """Check batch entities against citizen fraud registry."""
    if not settings.COMMUNITY_ENABLED:
        return CommunityLookupResponse(matches=[])

    items = [{"type": e.type, "value": e.value} for e in payload.entities]
    repo = CommunityRepository(db)
    matches = repo.lookup_entities(items)
    return CommunityLookupResponse(matches=matches)


@router.get("/stats", response_model=CommunityStatsResponse)
async def get_community_stats(
    db: Session = Depends(get_db),
) -> CommunityStatsResponse:
    """Get aggregated threat counts and top active scam patterns."""
    if not settings.COMMUNITY_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community intelligence feature is currently disabled.",
        )

    repo = CommunityRepository(db)
    stats = repo.get_stats()
    return CommunityStatsResponse(
        total_reports=stats["total_reports"],
        unique_entities=stats["unique_entities"],
        top_scam_types=stats["top_scam_types"],
    )
