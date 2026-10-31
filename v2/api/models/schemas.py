"""Pydantic schemas and contract models for Scam Shield v2 API."""

from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field, model_validator


# Common primitive types
VerdictLiteral = Literal["safe", "suspicious", "scam"]
LanguageLiteral = Literal["en", "hi", "auto"]
EntityTypeLiteral = Literal["phone", "upi", "domain"]
StageStatusLiteral = Literal["done", "degraded", "failed"]
LLMProviderLiteral = Literal["gemini", "groq", "none"]


# ============================================================================
# API Request Models
# ============================================================================

class AnalyzeRequest(BaseModel):
    """Payload for synchronous or streaming message analysis."""

    text: str | None = Field(default=None, description="Raw text message to analyze.")
    image_base64: str | None = Field(default=None, description="Base64-encoded screenshot bytes.")
    image_mime: str | None = Field(default=None, description="MIME type of the screenshot (image/png, image/jpeg, image/webp).")
    language: LanguageLiteral = Field(default="auto", description="Preferred output advice language.")

    @model_validator(mode="after")
    def check_input_present(self) -> "AnalyzeRequest":
        has_text = bool(self.text and self.text.strip())
        has_image = bool(self.image_base64 and self.image_base64.strip())
        if not has_text and not has_image:
            raise ValueError("At least one of 'text' or 'image_base64' must be provided.")
        return self


# ============================================================================
# General Responses
# ============================================================================

class HealthResponse(BaseModel):
    """System health and operational telemetry."""

    status: str = "ok"
    version: str
    gemini_configured: bool
    groq_configured: bool
    db_ok: bool
    uptime_s: float


class SampleItem(BaseModel):
    """Curated sample message for testing and evaluation."""

    id: str
    label: str
    category: str
    language: str
    text: str


# ============================================================================
# Community Reputation Models
# ============================================================================

class CommunityReportRequest(BaseModel):
    """Citizen fraud report submission (stores only hashed entity identifiers)."""

    entity_type: EntityTypeLiteral
    value: str = Field(..., description="Raw entity value to be securely normalized and hashed.")
    scam_type: str | None = None


class CommunityEntityItem(BaseModel):
    """Entity descriptor for community batch lookup."""

    type: EntityTypeLiteral
    value: str


class CommunityLookupRequest(BaseModel):
    """Lookup request for active scam intelligence matches."""

    entities: list[CommunityEntityItem]


class CommunityLookupMatch(BaseModel):
    """A match against community-reported fraudulent entities."""

    entity_type: str
    entity_masked: str
    report_count: int
    scam_type: str | None = None
    first_seen: str | None = None
    last_seen: str | None = None


class CommunityLookupResponse(BaseModel):
    """Matched threat intelligence entities."""

    matches: list[CommunityLookupMatch]


class CommunityStatsResponse(BaseModel):
    """Aggregated community threat statistics."""

    total_reports: int
    unique_entities: int
    top_scam_types: dict[str, int]


# ============================================================================
# SSE Streaming Event Models (Contract Version 1)
# ============================================================================

class BaseSSEEvent(BaseModel):
    """Common envelope attributes for all SSE messages."""

    v: int = Field(default=1, description="Protocol contract version.")
    request_id: str = Field(..., description="Unique client-request trace identifier.")


class PipelineStartEvent(BaseSSEEvent):
    """Emitted when pipeline execution begins."""

    stages: list[str] = Field(
        default=["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]
    )


class StageStartEvent(BaseSSEEvent):
    """Emitted when a specific agent begins processing."""

    stage: str


class StageResultEvent(BaseSSEEvent):
    """Emitted when an agent completes or degrades."""

    stage: str
    status: StageStatusLiteral
    output: dict[str, Any]
    duration_ms: float
    cached: bool = False
    llm_provider: LLMProviderLiteral = "none"
    tools_used: list[str] = Field(default_factory=list)


class ConflictDetail(BaseModel):
    """Details of a disagreement between behavioral and technical analysis."""

    analyst_signal: str
    checker_signal: str
    winner: Literal["checker", "analyst", "none"]
    resolution: str


class ConflictEvent(BaseSSEEvent):
    """Emitted only when behavioral tactics and entity intelligence disagree."""

    analyst_signal: str
    checker_signal: str
    winner: Literal["checker", "analyst", "none"]
    resolution: str


class AdvicePayload(BaseModel):
    """Actionable advice guidance."""

    headline: str
    summary: str
    do_not: list[str] = Field(default_factory=list)
    do_next: list[str] = Field(default_factory=list)
    report_to: list[str] = Field(default_factory=list)


class EntitiesPayload(BaseModel):
    """Extracted contact points and destination URLs."""

    urls: list[str] = Field(default_factory=list)
    phones: list[str] = Field(default_factory=list)
    upi_ids: list[str] = Field(default_factory=list)
    sender: str | None = None


class CommunityPayload(BaseModel):
    """Community threat verification matches."""

    matches: list[CommunityLookupMatch] = Field(default_factory=list)


class FinalResultEvent(BaseSSEEvent):
    """Comprehensive consolidated verdict and advisory response."""

    verdict: VerdictLiteral
    confidence: float = Field(..., ge=0.0, le=1.0, description="Normalized confidence between 0.0 and 1.0.")
    scam_type: str
    reasoning: str
    conflict: ConflictDetail | None = None
    advice: AdvicePayload
    share_text: str
    language: str
    entities: EntitiesPayload
    community: CommunityPayload
    total_ms: float
    cached: bool = False


class ErrorEvent(BaseSSEEvent):
    """Emitted when a terminal or partial failure occurs."""

    stage: str | None = None
    code: str
    message: str
    degraded: bool = False
