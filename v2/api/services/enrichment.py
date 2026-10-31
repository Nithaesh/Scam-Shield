"""Enrichment pipeline synthesizing taxonomy, WhatsApp share text, conflicts, and community data."""

from __future__ import annotations

from typing import Any
from v2.api.config import settings
from v2.api.models.schemas import (
    AdvicePayload,
    CommunityPayload,
    EntitiesPayload,
    FinalResultEvent,
)
from v2.api.services.scam_taxonomy import classify_scam_taxonomy
from v2.api.services.share_text import generate_share_text
from v2.api.services.conflict import detect_evidence_conflict
from v2.api.services.community import check_community_escalation
from v2.api.db.session import SessionLocal
from v2.api.db.repository import CommunityRepository


def enrich_analysis_result(
    result: Any,
    raw_text: str,
    language: str,
    request_id: str,
    total_ms: float = 0.0,
    cached: bool = False,
) -> FinalResultEvent:
    """Enrich orchestrator AnalysisResult into the v2 API FinalResultEvent contract."""
    # Extract sub-models safely (handles dict or Pydantic models)
    if isinstance(result, dict):
        ext_data = result.get("extracted", {})
        pat_data = result.get("pattern", {})
        ent_data = result.get("entity", {})
        ver_data = result.get("verdict", {})
        adv_data = result.get("advice", {})
    else:
        ext_data = result.extracted.model_dump()
        pat_data = result.pattern.model_dump()
        ent_data = result.entity.model_dump()
        ver_data = result.verdict.model_dump()
        adv_data = result.advice.model_dump()

    raw_verdict = str(ver_data.get("verdict", "suspicious")).lower()
    raw_confidence = int(ver_data.get("confidence", 70))
    normalized_confidence = round(float(raw_confidence) / 100.0, 2)

    tactics = list(pat_data.get("tactics", []))
    urls = list(ext_data.get("urls", []))
    phones = list(ext_data.get("phone_numbers", []))
    upi_ids = list(ext_data.get("upi_ids", []))
    sender = ext_data.get("sender")

    # 1. Deterministic Taxonomy
    scam_type = classify_scam_taxonomy(
        text=raw_text or str(ext_data.get("message_text", "")),
        verdict=raw_verdict,
        reasoning=str(ver_data.get("reasoning", "")),
        tactics=tactics,
        urls=urls,
    )

    # 2. Conflict Analysis
    conflict = detect_evidence_conflict(
        pattern_score=int(pat_data.get("score", 0)),
        entity_risk_score=int(ent_data.get("risk_score", 0)),
        tactics=tactics,
        findings=list(ent_data.get("findings", [])),
        judge_conflicts=list(ver_data.get("conflicts", [])),
    )

    # 3. Community Lookup & Escalation
    community_matches = []
    effective_verdict = raw_verdict
    reasoning_suffix = ""

    if settings.COMMUNITY_ENABLED:
        try:
            lookup_items = []
            for p in phones:
                lookup_items.append({"type": "phone", "value": p})
            for u in upi_ids:
                lookup_items.append({"type": "upi", "value": u})
            for link in urls:
                lookup_items.append({"type": "domain", "value": link})

            db = SessionLocal()
            try:
                repo = CommunityRepository(db)
                community_matches = repo.lookup_entities(lookup_items)
            finally:
                db.close()

            # Escalation check
            effective_verdict, escalation_note = check_community_escalation(
                current_verdict=raw_verdict,
                matches=community_matches,
                escalation_enabled=settings.COMMUNITY_ESCALATION,
            )
            if escalation_note:
                reasoning_suffix = f" [{escalation_note}]"
        except Exception:
            pass  # Community failure never interrupts core response

    final_reasoning = f"{ver_data.get('reasoning', '')}{reasoning_suffix}".strip()

    # 4. WhatsApp Share Text
    share_text = generate_share_text(
        verdict=effective_verdict,
        scam_type=scam_type,
        language=language,
        headline=str(adv_data.get("headline", "")),
    )

    return FinalResultEvent(
        v=1,
        request_id=request_id,
        verdict=effective_verdict,  # type: ignore[arg-type]
        confidence=normalized_confidence,
        scam_type=scam_type,
        reasoning=final_reasoning or "Automated multi-agent synthesis completed.",
        conflict=conflict,
        advice=AdvicePayload(
            headline=str(adv_data.get("headline", "Safety Guidance")),
            summary=str(adv_data.get("plain_summary", "")),
            do_not=list(adv_data.get("do_not", [])),
            do_next=list(adv_data.get("do_next", [])),
            report_to=list(adv_data.get("report_to", ["National Cyber Crime Helpline: 1930"])),
        ),
        share_text=share_text,
        language=language,
        entities=EntitiesPayload(
            urls=urls,
            phones=phones,
            upi_ids=upi_ids,
            sender=sender,
        ),
        community=CommunityPayload(matches=community_matches),
        total_ms=round(total_ms, 2),
        cached=cached,
    )
