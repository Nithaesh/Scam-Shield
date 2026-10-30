"""Orchestrator: Multi-agent coordination pipeline for Scam Shield."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from pathlib import Path
from typing import Any, Generator, Literal
from dotenv import load_dotenv

from agents.schemas import (
    Advice,
    AnalysisResult,
    EntityReport,
    Extracted,
    JudgeVerdict,
    PatternReport,
)
from agents.extractor import extract
from agents.pattern_analyst import analyze_patterns
from agents.entity_checker import check_entities_agent
from agents.judge import adjudicate
from agents.advisor import advise

load_dotenv()

logger = logging.getLogger("scam_shield.orchestrator")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

CACHE_DIR = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

MAX_INPUT_CHARS = 5000
AGENT_TIMEOUT_SECONDS = 35.0


def _compute_input_hash(input_data: str | bytes, language: str) -> str:
    """Generate SHA-256 fingerprint for cache key.

    Normalizes whitespace for text inputs so exact message content matches
    even with leading/trailing spaces or newline variations.
    """
    hasher = hashlib.sha256()
    hasher.update(language.encode("utf-8"))
    if isinstance(input_data, bytes):
        hasher.update(input_data)
    else:
        normalized_text = " ".join(str(input_data).strip().split())
        hasher.update(normalized_text.encode("utf-8"))
    return hasher.hexdigest()


def _get_cached_result(cache_key: str, start_time: float | None = None) -> AnalysisResult | None:
    """Retrieve and deserialize result from cache if present.

    Returns the cached result immediately in ~0ms, saving LLM tokens.
    """
    use_cache = os.getenv("USE_CACHE", "1").lower() in ("1", "true", "yes")
    if not use_cache:
        return None

    cache_file = CACHE_DIR / f"{cache_key}.json"
    if cache_file.exists():
        try:
            data = json.loads(cache_file.read_text(encoding="utf-8"))
            result = AnalysisResult.model_validate(data)
            result.cache_hit = True
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2) if start_time else 0.0
            result.timings_ms = {"total": elapsed_ms, "cached": 0.0}
            logger.info("Cache hit for input key %s: returned from local storage in %.1fms (0 LLM tokens consumed).", cache_key[:12], elapsed_ms)
            return result
        except Exception as e:
            logger.warning("Failed to read cache file %s: %s", cache_file, str(e))
    return None


def _save_cached_result(cache_key: str, result: AnalysisResult) -> None:
    """Persist result to cache file."""
    use_cache = os.getenv("USE_CACHE", "1").lower() in ("1", "true", "yes")
    if not use_cache:
        return

    cache_file = CACHE_DIR / f"{cache_key}.json"
    try:
        data = result.model_dump(mode="json")
        data["cache_hit"] = False
        cache_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        logger.debug("Result cached with key: %s", cache_key[:12])
    except Exception as e:
        logger.warning("Failed to write cache file %s: %s", cache_file, str(e))


def _handle_empty_input(language: Literal["auto", "en", "hi"]) -> AnalysisResult:
    """Return immediate safe result for empty or whitespace-only input."""
    target_lang = "hi" if language == "hi" else "en"
    return AnalysisResult(
        extracted=Extracted(
            sender=None,
            message_text="",
            urls=[],
            phone_numbers=[],
            upi_ids=[],
            language=target_lang if target_lang in ("en", "hi") else "en",
            claimed_organisation=None,
            summary="Empty input submitted.",
        ),
        pattern=PatternReport(
            status="ok",
            score=0,
            tactics=[],
            impersonated_entity=None,
            reasons=["No content to evaluate."],
        ),
        entity=EntityReport(
            status="ok",
            risk_score=0,
            findings=[],
            reasons=["No external entities present."],
            unchecked=[],
        ),
        verdict=JudgeVerdict(
            verdict="safe",
            confidence=100,
            reasoning="Input was empty or contained no text/entities.",
            conflicts=[],
            key_evidence=["Empty input"],
        ),
        advice=Advice(
            language=target_lang,
            headline="कोई संदेश प्राप्त नहीं हुआ" if target_lang == "hi" else "No message provided",
            do_not=[],
            do_next=[],
            report_to=[],
            plain_summary="कोई संदेश जांच के लिए नहीं भेजा गया।" if target_lang == "hi" else "No text or image content was submitted for analysis.",
        ),
        timings_ms={"total": 0.0},
        cache_hit=False,
    )


def analyse(
    input_data: str | bytes | Path,
    language: Literal["auto", "en", "hi"] = "auto",
) -> AnalysisResult:
    """Execute the Scam Shield multi-agent analysis pipeline end-to-end.

    Parameters:
        input_data: Raw text message, image bytes, or Path to an image file.
        language: Preferred advice language: "auto", "en", or "hi".

    Returns:
        AnalysisResult: Complete validated result including all agent outputs and timings.
    """
    total_start = time.perf_counter()
    timings: dict[str, float] = {}

    # Handle Path inputs
    mime_type = "image/png"
    if isinstance(input_data, Path) or (isinstance(input_data, str) and os.path.isfile(input_data)):
        path_obj = Path(input_data)
        ext = path_obj.suffix.lower()
        if ext in [".png", ".jpg", ".jpeg", ".webp"]:
            input_data = path_obj.read_bytes()
            mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else f"image/{ext.strip('.')}"
        else:
            input_data = path_obj.read_text(encoding="utf-8")

    # Handle empty string
    if isinstance(input_data, str) and not input_data.strip():
        logger.info("Empty input detected; returning default safe result.")
        return _handle_empty_input(language)

    # Handle oversized string
    if isinstance(input_data, str) and len(input_data) > MAX_INPUT_CHARS:
        logger.warning("Input exceeds maximum character length (%d > %d). Truncating.", len(input_data), MAX_INPUT_CHARS)
        input_data = input_data[:MAX_INPUT_CHARS]

    # Check Cache
    cache_key = _compute_input_hash(input_data, language)
    cached = _get_cached_result(cache_key, start_time=total_start)
    if cached:
        return cached

    # Stage 1: Extractor Agent
    stage_start = time.perf_counter()
    try:
        extracted = extract(input_data, image_mime_type=mime_type)
    except Exception as e:
        logger.error("Stage 1 Extractor crashed: %s", str(e))
        extracted = Extracted.fallback(message_text=str(input_data) if isinstance(input_data, str) else "[Binary image]")
    timings["extractor"] = round((time.perf_counter() - stage_start) * 1000, 2)

    # Stage 2: Parallel Pattern Analyst & Entity Checker
    parallel_start = time.perf_counter()
    pattern: PatternReport
    entity: EntityReport

    with ThreadPoolExecutor(max_workers=2) as executor:
        pattern_future = executor.submit(analyze_patterns, extracted)
        entity_future = executor.submit(check_entities_agent, extracted)

        # Retrieve Pattern Analyst
        try:
            pattern = pattern_future.result(timeout=AGENT_TIMEOUT_SECONDS)
        except (FuturesTimeoutError, Exception) as e:
            logger.error("Pattern Analyst agent failed or timed out: %s", str(e))
            pattern = PatternReport.fallback(reason=f"Pattern analyst error: {type(e).__name__}: {e}")

        # Retrieve Entity Checker
        try:
            entity = entity_future.result(timeout=AGENT_TIMEOUT_SECONDS)
        except (FuturesTimeoutError, Exception) as e:
            logger.error("Entity Checker agent failed or timed out: %s", str(e))
            entity = EntityReport.fallback(reason=f"Entity checker error: {type(e).__name__}: {e}")

    parallel_duration = round((time.perf_counter() - parallel_start) * 1000, 2)
    timings["pattern_analyst_and_entity_checker_parallel"] = parallel_duration

    # Stage 3: Judge Agent
    judge_start = time.perf_counter()
    try:
        verdict = adjudicate(extracted, pattern, entity)
    except Exception as e:
        logger.error("Stage 3 Judge crashed: %s", str(e))
        verdict = JudgeVerdict.fallback(reason=f"Judge error: {type(e).__name__}: {e}")
    timings["judge"] = round((time.perf_counter() - judge_start) * 1000, 2)

    # Stage 4: Advisor Agent
    advisor_start = time.perf_counter()
    try:
        advice = advise(verdict, extracted, requested_language=language)
    except Exception as e:
        logger.error("Stage 4 Advisor crashed: %s", str(e))
        target_lang = "hi" if language == "hi" or extracted.language in ("hi", "hinglish") else "en"
        advice = Advice.fallback(language=target_lang)
    timings["advisor"] = round((time.perf_counter() - advisor_start) * 1000, 2)

    timings["total"] = round((time.perf_counter() - total_start) * 1000, 2)

    result = AnalysisResult(
        extracted=extracted,
        pattern=pattern,
        entity=entity,
        verdict=verdict,
        advice=advice,
        timings_ms=timings,
        cache_hit=False,
    )

    _save_cached_result(cache_key, result)
    return result


def analyse_stream(
    input_data: str | bytes | Path,
    language: Literal["auto", "en", "hi"] = "auto",
) -> Generator[dict[str, Any], None, AnalysisResult]:
    """Stream execution progress for UI integration (cards / progress updates).

    Yields:
        dict: Event objects: {"stage": str, "status": "running" | "done", "data": Any}
    """
    total_start = time.perf_counter()
    timings: dict[str, float] = {}

    yield {"stage": "cache", "status": "checking"}
    cache_key = _compute_input_hash(input_data if isinstance(input_data, (str, bytes)) else str(input_data), language)
    cached = _get_cached_result(cache_key, start_time=total_start)
    if cached:
        yield {"stage": "cache", "status": "done", "data": cached.model_dump(mode="json")}
        return cached

    # Stage 1: Extractor
    yield {"stage": "extractor", "status": "running"}
    s1_start = time.perf_counter()
    extracted = extract(input_data)
    timings["extractor"] = round((time.perf_counter() - s1_start) * 1000, 2)
    yield {"stage": "extractor", "status": "done", "data": extracted.model_dump(mode="json")}

    # Stage 2: Parallel Pattern & Entity
    yield {"stage": "pattern_analyst", "status": "running"}
    yield {"stage": "entity_checker", "status": "running"}
    p_start = time.perf_counter()

    with ThreadPoolExecutor(max_workers=2) as executor:
        f_pattern = executor.submit(analyze_patterns, extracted)
        f_entity = executor.submit(check_entities_agent, extracted)

        pattern = f_pattern.result(timeout=AGENT_TIMEOUT_SECONDS)
        yield {"stage": "pattern_analyst", "status": "done", "data": pattern.model_dump(mode="json")}

        entity = f_entity.result(timeout=AGENT_TIMEOUT_SECONDS)
        yield {"stage": "entity_checker", "status": "done", "data": entity.model_dump(mode="json")}

    timings["parallel_analysis"] = round((time.perf_counter() - p_start) * 1000, 2)

    # Stage 3: Judge
    yield {"stage": "judge", "status": "running"}
    j_start = time.perf_counter()
    verdict = adjudicate(extracted, pattern, entity)
    timings["judge"] = round((time.perf_counter() - j_start) * 1000, 2)
    yield {"stage": "judge", "status": "done", "data": verdict.model_dump(mode="json")}

    # Stage 4: Advisor
    yield {"stage": "advisor", "status": "running"}
    a_start = time.perf_counter()
    advice = advise(verdict, extracted, requested_language=language)
    timings["advisor"] = round((time.perf_counter() - a_start) * 1000, 2)
    yield {"stage": "advisor", "status": "done", "data": advice.model_dump(mode="json")}

    timings["total"] = round((time.perf_counter() - total_start) * 1000, 2)
    result = AnalysisResult(
        extracted=extracted,
        pattern=pattern,
        entity=entity,
        verdict=verdict,
        advice=advice,
        timings_ms=timings,
        cache_hit=False,
    )
    _save_cached_result(cache_key, result)
    yield {"stage": "complete", "status": "done", "data": result.model_dump(mode="json")}
    return result


if __name__ == "__main__":
    sample_text = sys.argv[1] if len(sys.argv) > 1 else (
        "Dear Customer, your SBI YONO account has been suspended due to incomplete KYC. "
        "Click immediately to update: http://sbi-kyc-update.xyz or call 9876543210"
    )
    print(f"--- Running Scam Shield Orchestrator on Input ---\n'{sample_text}'\n")
    final_res = analyse(sample_text)
    print("=== ANALYSIS RESULT ===")
    print(final_res.model_dump_json(indent=2))
