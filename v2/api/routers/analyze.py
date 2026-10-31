"""Message analysis endpoints: synchronous JSON and real-time Server-Sent Events (SSE)."""

from __future__ import annotations

import json
from typing import Any, AsyncGenerator
from fastapi import APIRouter, HTTPException, Request, status
from sse_starlette.sse import EventSourceResponse

from v2.api.config import settings
from v2.api.models.schemas import AnalyzeRequest, FinalResultEvent
from v2.api.middleware.rate_limit import limiter
from v2.api.services.normalize import normalize_text, resolve_language
from v2.api.services.image_validation import validate_and_sanitize_image
from v2.api.services.pipeline import stream_pipeline_analysis

router = APIRouter(tags=["Analyze"])


def _extract_and_validate_payload(request: AnalyzeRequest) -> tuple[str | bytes, str, str]:
    """Validate and clean input text/image payload."""
    raw_text = (request.text or "").strip()
    has_text = bool(raw_text)
    has_image = bool(request.image_base64 and request.image_base64.strip())

    if not has_text and not has_image:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one of 'text' or 'image_base64' must be provided.",
        )

    # Validate image if provided
    image_bytes = None
    if has_image:
        try:
            image_bytes, _ = validate_and_sanitize_image(
                image_base64=request.image_base64,  # type: ignore[arg-type]
                image_mime=request.image_mime,
                max_mb=settings.MAX_IMAGE_MB,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            ) from exc

    # Sanitize text
    cleaned_text = normalize_text(raw_text, max_chars=settings.MAX_TEXT_CHARS)
    if has_text and not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Input text contained only empty, whitespace, or invalid characters.",
        )

    # Determine primary input data for orchestrator
    input_data: str | bytes = image_bytes if image_bytes is not None else cleaned_text
    resolved_lang = resolve_language(request.language, cleaned_text)

    return input_data, resolved_lang, cleaned_text


async def _run_sync_analysis(
    request: Request,
    payload: AnalyzeRequest,
) -> FinalResultEvent:
    """Consume the streaming generator internally to produce a consolidated JSON result."""
    input_data, resolved_lang, cleaned_text = _extract_and_validate_payload(payload)
    request_id = getattr(request.state, "request_id", "sync_req")

    final_event: FinalResultEvent | None = None

    async for sse_item in stream_pipeline_analysis(
        input_data=input_data,
        language=resolved_lang,
        request_id=request_id,
        raw_text=cleaned_text,
    ):
        event_name = sse_item.get("event")
        if event_name == "final":
            final_data = json.loads(sse_item["data"])
            final_event = FinalResultEvent.model_validate(final_data)

    if not final_event:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate verdict from multi-agent pipeline.",
        )

    return final_event


@router.post("/analyze")
@limiter.limit(settings.RATE_LIMIT_ANALYZE)
async def analyze_message_endpoint(
    request: Request,
    payload: AnalyzeRequest,
):
    """Analyze endpoint supporting both SSE stream and synchronous JSON response.
    
    If payload.stream is True or Accept: text/event-stream is present, returns an SSE EventSourceResponse.
    Otherwise returns a single synchronous FinalResultEvent JSON.
    """
    accept_header = request.headers.get("accept", "")
    wants_stream = payload.stream or "text/event-stream" in accept_header

    if wants_stream:
        return await analyze_message_stream(request, payload)

    return await _run_sync_analysis(request, payload)


@router.post("/analyze/stream")
@limiter.limit(settings.RATE_LIMIT_ANALYZE)
async def analyze_message_stream(
    request: Request,
    payload: AnalyzeRequest,
) -> EventSourceResponse:
    """Stream real-time multi-agent progression events via Server-Sent Events (SSE)."""
    input_data, resolved_lang, cleaned_text = _extract_and_validate_payload(payload)
    request_id = getattr(request.state, "request_id", "stream_req")

    async def event_generator() -> AsyncGenerator[dict[str, Any], None]:
        async for sse_dict in stream_pipeline_analysis(
            input_data=input_data,
            language=resolved_lang,
            request_id=request_id,
            raw_text=cleaned_text,
        ):
            # Check for client disconnect
            if await request.is_disconnected():
                break

            yield {
                "event": sse_dict.get("event", "message"),
                "data": sse_dict.get("data", "{}"),
            }

    return EventSourceResponse(
        event_generator(),
        ping=10,  # 10 second ping heartbeat to keep connection alive
        headers={
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
        },
    )
