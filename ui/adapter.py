"""The only module that talks to the teammate's orchestrator.

Everything the UI receives is normalised here:

    {"stage": "extractor|pattern_analyst|entity_checker|judge|advisor|complete",
     "status": "waiting|running|done|could_not_check|error",
     "data": <agent dict or full AnalysisResult>}

The adapter tolerates missing keys, cache hits, agent failures and image
inputs. No other UI module imports ``orchestrator``.
"""

from __future__ import annotations

import logging
import os
import queue
import tempfile
import threading
import time
from pathlib import Path
from typing import Any, Callable, Generator, Iterable

from ui.stub_orchestrator import stream_stub

logger = logging.getLogger("scam_shield.ui.adapter")

STAGES: tuple[str, ...] = (
    "extractor",
    "pattern_analyst",
    "entity_checker",
    "judge",
    "advisor",
)
STAGE_KEYS: dict[str, str] = {
    "extractor": "extracted",
    "pattern_analyst": "pattern",
    "entity_checker": "entity",
    "judge": "verdict",
    "advisor": "advice",
}
STAGE_ALIASES: dict[str, str] = {
    "pattern": "pattern_analyst",
    "pattern_analyst_agent": "pattern_analyst",
    "entity": "entity_checker",
    "entity_checker_agent": "entity_checker",
}
DEFAULT_TIMEOUT_SECONDS = 180.0

try:  # Import failure must never stop the UI from loading.
    import orchestrator as _orchestrator

    _ANALYSE: Callable[..., Any] | None = getattr(_orchestrator, "analyse", None)
    _ANALYSE_STREAM: Callable[..., Any] | None = getattr(_orchestrator, "analyse_stream", None)
    _IMPORT_ERROR = "" if (_ANALYSE and _ANALYSE_STREAM) else "missing analyse/analyse_stream"
except Exception as exc:  # pragma: no cover - exercised when the layer is absent
    _orchestrator = None
    _ANALYSE = None
    _ANALYSE_STREAM = None
    _IMPORT_ERROR = f"{type(exc).__name__}: {exc}"
    logger.warning("Orchestrator import failed; demo mode will be used: %s", exc)


class _WorkerError:
    """Sentinel carrying an exception raised inside a worker thread."""

    def __init__(self, error: BaseException) -> None:
        self.error = error


_END = object()


def _truthy(value: str | None) -> bool:
    return str(value or "").strip().lower() in ("1", "true", "yes", "on")


def orchestrator_available() -> bool:
    """Return True when the teammate's orchestrator imported successfully."""
    return _ANALYSE is not None and _ANALYSE_STREAM is not None


def orchestrator_import_error() -> str:
    """Return a short import error string (empty when healthy)."""
    return _IMPORT_ERROR


def _has_llm_key() -> bool:
    return any(os.getenv(name, "").strip() for name in ("GEMINI_API_KEY", "GROQ_API_KEY"))


def default_stub_mode() -> tuple[bool, str]:
    """Choose demo vs live mode and return ``(use_stub, reason_key)``.

    ``USE_STUB_UI`` is honoured when explicitly set. Without an explicit value
    the UI uses the real agent layer if it imported and at least one LLM key is
    configured; otherwise it falls back to polished demo data.
    """
    explicit = os.getenv("USE_STUB_UI")
    if explicit is not None and str(explicit).strip() != "":
        if _truthy(explicit):
            return True, "forced"
        if not orchestrator_available():
            return True, "import"
        return False, "real"
    if not orchestrator_available():
        return True, "import"
    if not _has_llm_key():
        return True, "no_key"
    return False, "real"


def stub_reason_i18n_key(reason: str) -> str:
    """Map an adapter reason to an i18n key used by the demo badge."""
    return {
        "no_key": "demo_reason_no_key",
        "forced": "demo_reason_forced",
        "import": "demo_reason_import",
    }.get(reason, "demo_reason_forced")


def _normalise(raw: Any) -> dict[str, Any] | None:
    """Normalise one raw orchestrator event, dropping noise."""
    if not isinstance(raw, dict):
        return None
    stage = str(raw.get("stage", "")).strip().lower()
    stage = STAGE_ALIASES.get(stage, stage)
    if stage in ("cache", "complete"):
        return {"stage": stage, "status": str(raw.get("status", "done")), "data": raw.get("data")}
    if stage not in STAGES:
        return None
    status = str(raw.get("status", "done")).strip().lower()
    if status not in ("running", "done", "could_not_check", "error"):
        status = "done"
    data = raw.get("data")
    if (
        status == "done"
        and isinstance(data, dict)
        and str(data.get("status", "")).strip().lower() == "could_not_check"
    ):
        status = "could_not_check"
    return {"stage": stage, "status": status, "data": data}


def _events_from_result(result: Any) -> Iterable[dict[str, Any]]:
    """Expand a full AnalysisResult into five agent events plus complete."""
    payload = result if isinstance(result, dict) else {}
    for stage in STAGES:
        data = payload.get(STAGE_KEYS[stage]) if isinstance(payload, dict) else None
        status = "done"
        if isinstance(data, dict) and str(data.get("status", "")).lower() == "could_not_check":
            status = "could_not_check"
        yield {"stage": stage, "status": status, "data": data if isinstance(data, dict) else {}}
    yield {"stage": "complete", "status": "done", "data": payload}


def _threaded_stream(
    producer: Callable[[Callable[[Any], None]], None],
    timeout_s: float,
) -> Generator[Any, None, None]:
    """Run ``producer`` in a daemon thread and yield what it puts on a queue."""
    items: queue.Queue[Any] = queue.Queue()

    def worker() -> None:
        try:
            producer(items.put)
        except BaseException as exc:  # noqa: BLE001 - must never kill the UI
            items.put(_WorkerError(exc))
        finally:
            items.put(_END)

    thread = threading.Thread(target=worker, name="scam-shield-agent", daemon=True)
    thread.start()
    deadline = time.monotonic() + max(5.0, timeout_s)
    while True:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise TimeoutError(f"Analysis exceeded {timeout_s:.0f}s")
        try:
            item = items.get(timeout=min(0.1, remaining))
        except queue.Empty:
            continue
        if item is _END:
            return
        if isinstance(item, _WorkerError):
            raise item.error
        yield item


def _active_stage(seen: dict[str, dict[str, Any]]) -> str:
    """Return the most recently running stage, or the first unfinished one."""
    running = [stage for stage, event in seen.items() if event.get("status") == "running"]
    if running:
        return running[-1]
    for stage in STAGES:
        if stage not in seen:
            return stage
    return STAGES[-1]


def _error_events(stage: str, exc: BaseException) -> Iterable[dict[str, Any]]:
    logger.error("Analysis stream failed at %s: %s", stage, exc)
    yield {
        "stage": stage,
        "status": "could_not_check",
        "data": {"reason": "This check did not complete."},
        "error": True,
    }
    yield {"stage": "complete", "status": "error", "data": None, "error": True}


def _stream_real_text(
    text: str,
    language: str,
    timeout_s: float,
) -> Generator[dict[str, Any], None, None]:
    """Consume the real ``analyse_stream`` with cache/failure handling."""
    assert _ANALYSE_STREAM is not None and _ANALYSE is not None
    seen: dict[str, dict[str, Any]] = {}
    finished = False

    try:
        for raw in _threaded_stream(
            lambda put: [put(event) for event in _ANALYSE_STREAM(text, language)],
            timeout_s=timeout_s,
        ):
            event = _normalise(raw)
            if not event:
                continue
            stage = event["stage"]
            if stage == "cache":
                if str(event["status"]).lower() == "done" and isinstance(event.get("data"), dict):
                    yield from _events_from_result(event["data"])
                    return
                continue
            if stage == "complete":
                result = event.get("data")
                if isinstance(result, dict):
                    for pending in STAGES:
                        if pending not in seen:
                            yield from _one_stage_event(pending, result)
                    yield {"stage": "complete", "status": "done", "data": result}
                    finished = True
                    return
                continue
            yield event
            seen[stage] = event
    except Exception as exc:  # noqa: BLE001 - recover via the non-streaming API
        logger.warning("Streaming failed; retrying with analyse(): %s", exc)
        stage = _active_stage(seen)
        try:
            result = _threaded_call(_ANALYSE, text, language, timeout_s=timeout_s)
            for pending in STAGES:
                if pending not in seen or seen[pending].get("status") == "running":
                    yield from _one_stage_event(pending, result)
            yield {"stage": "complete", "status": "done", "data": result, "recovered": True}
            return
        except Exception as retry_exc:  # noqa: BLE001
            yield from _error_events(stage, retry_exc)
            return

    if not finished:
        stage = _active_stage(seen)
        yield from _error_events(stage, RuntimeError("stream ended without a result"))


def _one_stage_event(stage: str, result: dict[str, Any]) -> Iterable[dict[str, Any]]:
    data = result.get(STAGE_KEYS[stage])
    status = "done"
    if isinstance(data, dict) and str(data.get("status", "")).lower() == "could_not_check":
        status = "could_not_check"
    yield {"stage": stage, "status": status, "data": data if isinstance(data, dict) else {}}


def _threaded_call(fn: Callable[..., Any], *args: Any, timeout_s: float) -> Any:
    """Call a blocking function in a daemon thread with a hard deadline."""
    box: queue.Queue[Any] = queue.Queue()

    def worker() -> None:
        try:
            box.put(fn(*args))
        except BaseException as exc:  # noqa: BLE001
            box.put(_WorkerError(exc))

    threading.Thread(target=worker, name="scam-shield-call", daemon=True).start()
    try:
        item = box.get(timeout=max(5.0, timeout_s))
    except queue.Empty as exc:
        raise TimeoutError(f"Call exceeded {timeout_s:.0f}s") from exc
    if isinstance(item, _WorkerError):
        raise item.error
    return item


def _image_suffix(image_name: str | None) -> str:
    suffix = Path(image_name or "").suffix.lower()
    return suffix if suffix in (".png", ".jpg", ".jpeg", ".webp") else ".png"


def _stream_real_image(
    image_bytes: bytes,
    image_name: str | None,
    language: str,
    timeout_s: float,
) -> Generator[dict[str, Any], None, None]:
    """Analyse a screenshot via ``analyse(Path)`` and expand the result."""
    assert _ANALYSE is not None
    yield {"stage": "extractor", "status": "running"}
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=_image_suffix(image_name)) as handle:
            handle.write(image_bytes)
            temp_path = Path(handle.name)
        result = _threaded_call(_ANALYSE, temp_path, language, timeout_s=timeout_s)
        if not isinstance(result, (dict,)):
            result = result.model_dump(mode="json")
        yield from _events_from_result(result)
    except Exception as exc:  # noqa: BLE001
        yield from _error_events("extractor", exc)
    finally:
        if temp_path is not None:
            try:
                temp_path.unlink(missing_ok=True)
            except OSError:
                logger.debug("Could not remove temporary screenshot %s", temp_path)


def stream_analysis(
    input_data: str | bytes | Path,
    language: str = "auto",
    *,
    use_stub: bool | None = None,
    image_name: str | None = None,
    simulate_partial: bool = False,
    timeout_s: float = DEFAULT_TIMEOUT_SECONDS,
) -> Generator[dict[str, Any], None, None]:
    """Yield UI events for text or an image, never raising to the caller."""
    if use_stub is None:
        use_stub, _ = default_stub_mode()

    if use_stub or not orchestrator_available():
        text = input_data if isinstance(input_data, str) else "[Screenshot uploaded]"
        if isinstance(input_data, bytes) and not text.strip():
            text = "[Screenshot uploaded]"
        try:
            yield from stream_stub(text, language, simulate_partial=simulate_partial)
        except Exception as exc:  # noqa: BLE001
            yield from _error_events("extractor", exc)
        return

    if isinstance(input_data, bytes):
        yield from _stream_real_image(input_data, image_name, language, timeout_s)
        return

    if isinstance(input_data, Path):
        # Image paths from the UI are converted to bytes before this point.
        try:
            input_data = input_data.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            yield from _error_events("extractor", exc)
            return

    text = str(input_data or "")
    if not text.strip():
        text = "(empty message)"
    text = text[:5000]
    yield from _stream_real_text(text, language, timeout_s)


def result_from_events(events: Iterable[dict[str, Any]]) -> dict[str, Any] | None:
    """Return the final result carried by a complete event, if any."""
    result: dict[str, Any] | None = None
    for event in events:
        if event.get("stage") == "complete" and isinstance(event.get("data"), dict):
            result = event["data"]
    return result
