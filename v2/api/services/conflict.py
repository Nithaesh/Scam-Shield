"""Detect and format tension between behavioral language analysis and technical entity evidence."""

from __future__ import annotations

from typing import Any
from v2.api.models.schemas import ConflictDetail


def detect_evidence_conflict(
    pattern_score: int,
    entity_risk_score: int,
    tactics: list[str],
    findings: list[dict[str, Any]],
    judge_conflicts: list[dict[str, Any]] | None = None,
) -> ConflictDetail | None:
    """Evaluate if behavioral tactics and technical evidence disagree.

    Returns:
        ConflictDetail | None: Formatted conflict object or None if agents agree.
    """
    # 1. Check if Judge already identified an explicit conflict
    if judge_conflicts and len(judge_conflicts) > 0:
        first = judge_conflicts[0]
        desc = str(first.get("description", ""))
        reso = str(first.get("resolution", ""))
        if desc:
            return ConflictDetail(
                analyst_signal=f"Behavioral evaluation noted: {desc}",
                checker_signal="Technical entity checks evaluated destination infrastructure and sender credibility.",
                winner="checker" if entity_risk_score > pattern_score else "analyst",
                resolution=reso or "Technical infrastructure evidence was given precedence over surface wording.",
            )

    has_high_findings = any(
        str(f.get("severity", "")).lower() == "high" for f in findings
    )
    has_lookalike = any(
        "lookalike" in str(f.get("signal", "")).lower() for f in findings
    )

    # 2. Case A: Polite/routine wording but malicious technical link or lookalike
    if (pattern_score <= 35) and (entity_risk_score >= 60 or has_high_findings or has_lookalike):
        return ConflictDetail(
            analyst_signal="Wording appeared official, calm, or routine with minimal behavioral pressure.",
            checker_signal="Technical inspection detected high-risk lookalike destination or unverified sender credentials.",
            winner="checker",
            resolution="Technical evidence takes precedence: deceptive infrastructure confirms fraud regardless of polite phrasing.",
        )

    # 3. Case B: High urgency tone, but verified official domain and TRAI header
    if (pattern_score >= 65) and (entity_risk_score <= 15) and not has_high_findings:
        return ConflictDetail(
            analyst_signal="Strong urgency and threat tactics detected (e.g. immediate action required).",
            checker_signal="Technical checks verified authentic official TRAI header and legitimate brand domain.",
            winner="checker",
            resolution="Urgent wording represents a standard official security notification; all technical endpoints are verified clean.",
        )

    return None
