"""Async streaming pipeline bridge executing the legacy orchestrator in a managed worker thread."""

from __future__ import annotations

import asyncio
import os
import queue
import threading
import time
from typing import Any, AsyncGenerator
from v2.api.config import settings
from v2.api.models.schemas import (
    ConflictEvent,
    ErrorEvent,
    FinalResultEvent,
    PipelineStartEvent,
    StageResultEvent,
    StageStartEvent,
)
from v2.api.services.enrichment import enrich_analysis_result
from v2.api.services.conflict import detect_evidence_conflict

# Sentinel objects for threading queue
_QUEUE_END = object()


class _WorkerError:
    def __init__(self, exc: Exception) -> None:
        self.exc = exc


def _run_orchestrator_in_thread(
    input_data: str | bytes,
    language: str,
    q: queue.Queue,
) -> None:
    """Worker target running the synchronous orchestrator generator."""
    try:
        from orchestrator import analyse_stream

        generator = analyse_stream(input_data, language=language)  # type: ignore[arg-type]
        for event in generator:
            q.put(event)
        q.put(_QUEUE_END)
    except Exception as exc:
        q.put(_WorkerError(exc))


async def stream_pipeline_analysis(
    input_data: str | bytes,
    language: str,
    request_id: str,
    raw_text: str = "",
    timeout_s: float | None = None,
) -> AsyncGenerator[dict[str, Any], None]:
    """Execute analysis and yield contract-compliant SSE event dictionaries.

    Handles worker thread management, stage translation, heartbeats, and timeout degradation.
    """
    effective_timeout = timeout_s or settings.PIPELINE_TIMEOUT_S
    total_start = time.perf_counter()

    # 1. Pipeline Start
    start_event = PipelineStartEvent(
        v=1,
        request_id=request_id,
        stages=["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"],
    )
    yield {"event": "pipeline_start", "data": start_event.model_dump_json()}

    # Check for offline mock mode
    use_mock = os.getenv("USE_STUB_UI", "0").lower() in ("1", "true", "yes")
    has_keys = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GROQ_API_KEY"))

    if use_mock or not has_keys:
        async for sse in _stream_offline_mock(input_data, language, request_id, raw_text, total_start):
            yield sse
        return

    # Thread communication queue
    q: queue.Queue = queue.Queue()
    worker = threading.Thread(
        target=_run_orchestrator_in_thread,
        args=(input_data, language, q),
        daemon=True,
    )
    worker.start()

    stage_timings: dict[str, float] = {}
    stage_outputs: dict[str, Any] = {}
    conflict_emitted = False
    final_result_data: dict[str, Any] | None = None
    is_cached = False

    deadline = time.time() + effective_timeout

    try:
        while True:
            # Enforce overall timeout
            remaining = deadline - time.time()
            if remaining <= 0:
                raise TimeoutError("Pipeline exceeded maximum execution budget (25s).")

            # Check for events from worker thread without blocking the async loop
            try:
                item = q.get_nowait()
            except queue.Empty:
                await asyncio.sleep(0.05)
                continue

            if item is _QUEUE_END:
                break

            if isinstance(item, _WorkerError):
                raise item.exc

            if not isinstance(item, dict):
                continue

            stage = str(item.get("stage", "")).lower()
            status = str(item.get("status", "done")).lower()
            data = item.get("data")

            # Handle Cache Hit Event
            if stage == "cache":
                if status == "done" and isinstance(data, dict):
                    is_cached = True
                    final_result_data = data
                continue

            # Handle Agent Stages
            if status == "running":
                stage_timings[stage] = time.perf_counter()
                yield {
                    "event": "stage_start",
                    "data": StageStartEvent(v=1, request_id=request_id, stage=stage).model_dump_json(),
                }

            elif status in ("done", "could_not_check", "error"):
                s_start = stage_timings.get(stage, time.perf_counter())
                duration_ms = round((time.perf_counter() - s_start) * 1000, 2)
                stage_status = (
                    "failed"
                    if status == "error"
                    else ("degraded" if status == "could_not_check" else "done")
                )

                if isinstance(data, dict):
                    stage_outputs[stage] = data

                # Determine tools and provider
                provider = "none"
                tools = []
                if stage in ("extractor", "pattern_analyst", "judge", "advisor"):
                    provider = "groq" if os.getenv("FORCE_FALLBACK", "0") == "1" else "gemini"
                elif stage == "entity_checker":
                    tools = ["domain_lookalikes", "whois", "phonenumbers", "upi_validator", "trai_header"]

                yield {
                    "event": "stage_result",
                    "data": StageResultEvent(
                        v=1,
                        request_id=request_id,
                        stage=stage,
                        status=stage_status,  # type: ignore[arg-type]
                        output=data if isinstance(data, dict) else {},
                        duration_ms=duration_ms,
                        cached=is_cached,
                        llm_provider=provider,  # type: ignore[arg-type]
                        tools_used=tools,
                    ).model_dump_json(),
                }

                # Evaluate potential conflict when Stage 2 completes
                if (
                    not conflict_emitted
                    and "pattern_analyst" in stage_outputs
                    and "entity_checker" in stage_outputs
                ):
                    pat = stage_outputs["pattern_analyst"]
                    ent = stage_outputs["entity_checker"]
                    conf = detect_evidence_conflict(
                        pattern_score=int(pat.get("score", 0)),
                        entity_risk_score=int(ent.get("risk_score", 0)),
                        tactics=list(pat.get("tactics", [])),
                        findings=list(ent.get("findings", [])),
                    )
                    if conf:
                        conflict_emitted = True
                        yield {
                            "event": "conflict",
                            "data": ConflictEvent(
                                v=1,
                                request_id=request_id,
                                analyst_signal=conf.analyst_signal,
                                checker_signal=conf.checker_signal,
                                winner=conf.winner,
                                resolution=conf.resolution,
                            ).model_dump_json(),
                        }

            if stage == "complete" and isinstance(data, dict):
                final_result_data = data

    except (TimeoutError, Exception) as exc:
        is_timeout = isinstance(exc, TimeoutError)
        err_msg = str(exc)
        err_code = "PIPELINE_TIMEOUT" if is_timeout else "PIPELINE_ERROR"

        yield {
            "event": "error",
            "data": ErrorEvent(
                v=1,
                request_id=request_id,
                stage=None,
                code=err_code,
                message=err_msg,
                degraded=True,
            ).model_dump_json(),
        }

        # Safe degradation fallback: never crash; return suspicious with explanation
        fallback_final = FinalResultEvent(
            v=1,
            request_id=request_id,
            verdict="suspicious",
            confidence=0.50,
            scam_type="impersonation_other",
            reasoning=f"Pipeline evaluation could not complete within the 25s time budget ({err_msg}). Treating as suspicious out of abundance of caution.",
            conflict=None,
            advice={
                "headline": "सावधानी बरतें: पूरी जांच पूरी नहीं हो सकी" if language == "hi" else "Stay Cautious: Analysis Could Not Complete",
                "summary": "तकनीकी समस्या या समय सीमा समाप्त होने के कारण संदेश की पूरी जांच नहीं हो सकी।" if language == "hi" else "A complete security verification could not finish before the timeout deadline.",
                "do_not": ["संदेश में आए किसी भी लिंक पर क्लिक न करें।", "कोई भी गोपनीय विवरण साझा न करें।"] if language == "hi" else ["Do not click on links in the message.", "Never disclose confidential credentials."],
                "do_next": ["अपने बैंक के आधिकारिक ऐप पर जांच करें।", "हेल्पलाइन 1930 पर संपर्क करें।"] if language == "hi" else ["Verify via your bank's official app.", "Contact Cyber Crime Helpline 1930."],
                "report_to": ["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
            },
            share_text="⚠️ Scam Shield: Message check was incomplete. Stay vigilant and call 1930 for advice.",
            language=language,
            entities={"urls": [], "phones": [], "upi_ids": [], "sender": None},
            community={"matches": []},
            total_ms=round((time.perf_counter() - total_start) * 1000, 2),
            cached=False,
        )
        yield {"event": "final", "data": fallback_final.model_dump_json()}
        return

    # Yield Final Enriched Result
    total_elapsed = (time.perf_counter() - total_start) * 1000
    if final_result_data:
        final_enriched = enrich_analysis_result(
            result=final_result_data,
            raw_text=raw_text,
            language=language,
            request_id=request_id,
            total_ms=total_elapsed,
            cached=is_cached,
        )
        yield {"event": "final", "data": final_enriched.model_dump_json()}


async def _stream_offline_mock(
    input_data: str | bytes,
    language: str,
    request_id: str,
    raw_text: str,
    total_start: float,
) -> AsyncGenerator[dict[str, Any], None]:
    """Lightweight deterministic offline mock stream for testing without external API keys."""
    text_content = raw_text or (input_data.decode("utf-8", errors="ignore") if isinstance(input_data, bytes) else str(input_data))
    text_lower = text_content.lower()

    is_scam = any(
        kw in text_lower
        for kw in (
            "blocked", "disconnect", "bill", "kyc", "apk", "lottery", "kbc",
            "cbi", "arrest", "pin", "कट", "ब्लॉक", "रिफंड", "वारंट"
        )
    )
    is_safe = ("debited" in text_lower or "credited" in text_lower or "otp" in text_lower) and not is_scam

    verdict_str = "scam" if is_scam else ("safe" if is_safe else "suspicious")
    conf_score = 0.95 if is_scam else (0.92 if is_safe else 0.65)
    scam_type = "electricity_bill" if "electricity" in text_lower or "बिजली" in text_lower else (
        "bank_kyc" if "kyc" in text_lower or "sbi" in text_lower else (
            "digital_arrest" if "arrest" in text_lower or "cbi" in text_lower else (
                "none" if is_safe else "phishing_link_other"
            )
        )
    )

    # Yield mock stages
    stages = ["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]
    for s in stages:
        yield {
            "event": "stage_start",
            "data": StageStartEvent(v=1, request_id=request_id, stage=s).model_dump_json(),
        }
        await asyncio.sleep(0.02)
        yield {
            "event": "stage_result",
            "data": StageResultEvent(
                v=1,
                request_id=request_id,
                stage=s,
                status="done",
                output={"status": "ok", "mock": True},
                duration_ms=20.0,
                cached=False,
                llm_provider="none",
                tools_used=["mock_engine"],
            ).model_dump_json(),
        }

    total_elapsed = (time.perf_counter() - total_start) * 1000
    final_mock = FinalResultEvent(
        v=1,
        request_id=request_id,
        verdict=verdict_str,  # type: ignore[arg-type]
        confidence=conf_score,
        scam_type=scam_type,
        reasoning="Evaluated using Scam Shield deterministic offline rules.",
        conflict=None,
        advice={
            "headline": "सुरक्षा अलर्ट" if language == "hi" else "Security Advisory",
            "summary": "यह संदेश धोखाधड़ी हो सकता है।" if is_scam else "संदेश सामान्य प्रतीत होता है।",
            "do_not": ["कोई भी OTP या पासवर्ड साझा न करें।", "अनजान लिंक पर क्लिक न करें।"],
            "do_next": ["बैंक ऐप पर सत्यापित करें।", "साइबर हेल्पलाइन 1930 पर संपर्क करें।"],
            "report_to": ["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"],
        },
        share_text="🚨 Scam Shield Family Alert: Be vigilant against fraud. Helpline: 1930",
        language=language,
        entities={"urls": [], "phones": [], "upi_ids": [], "sender": None},
        community={"matches": []},
        total_ms=round(total_elapsed, 2),
        cached=False,
    )
    yield {"event": "final", "data": final_mock.model_dump_json()}
