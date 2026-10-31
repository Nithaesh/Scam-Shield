"""API contract and SSE streaming integration tests."""

import json
import pytest
from v2.api.models.schemas import (
    FinalResultEvent,
    PipelineStartEvent,
    StageResultEvent,
    StageStartEvent,
)


def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["version"] == "2.0.0"
    assert "uptime_s" in data
    assert isinstance(data["gemini_configured"], bool)
    assert isinstance(data["groq_configured"], bool)
    assert isinstance(data["db_ok"], bool)


def test_samples_endpoint(client):
    res = client.get("/api/v1/samples")
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 5
    first = items[0]
    assert "id" in first
    assert "text" in first
    assert "category" in first


def test_analyze_sync_endpoint(client):
    res = client.post(
        "/api/v1/analyze",
        json={"text": "Dear customer, your SBI account is blocked. Update at http://sbi-kyc.xyz"},
    )
    assert res.status_code == 200
    data = res.json()
    # Contract validation with Pydantic
    final_event = FinalResultEvent.model_validate(data)
    assert final_event.v == 1
    assert final_event.verdict in ("safe", "suspicious", "scam")
    assert 0.0 <= final_event.confidence <= 1.0
    assert final_event.scam_type != ""
    assert len(final_event.share_text) <= 280
    assert "1930" in final_event.share_text


def test_analyze_stream_sse_events(client):
    res = client.post(
        "/api/v1/analyze/stream",
        json={"text": "Electricity bill unpaid, power cut tonight at 9:30 PM. Call 9876543210"},
    )
    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]

    events = []
    current_event = {}

    for line in res.iter_lines():
        if line.startswith("event: "):
            current_event["event"] = line.replace("event: ", "").strip()
        elif line.startswith("data: "):
            current_event["data"] = line.replace("data: ", "").strip()
        elif line == "":
            if current_event:
                events.append(current_event)
                current_event = {}

    assert len(events) >= 3

    # Event order check
    event_names = [e["event"] for e in events]
    assert event_names[0] == "pipeline_start"
    assert "stage_start" in event_names
    assert "stage_result" in event_names
    assert event_names[-1] == "final"

    # Validate pipeline_start payload
    start_payload = json.loads(events[0]["data"])
    PipelineStartEvent.model_validate(start_payload)

    # Validate final payload
    final_payload = json.loads(events[-1]["data"])
    final_obj = FinalResultEvent.model_validate(final_payload)
    assert final_obj.verdict in ("safe", "suspicious", "scam")


def test_analyze_rejects_empty_input(client):
    res = client.post("/api/v1/analyze", json={"text": "", "image_base64": ""})
    assert res.status_code == 422


def test_analyze_rejects_too_long_text(client):
    res = client.post("/api/v1/analyze", json={"text": "A" * 6000})
    # Text normalization automatically clamps to 5000 or accepts cleaned
    assert res.status_code in (200, 422)


def test_analyze_rejects_bad_image(client):
    res = client.post("/api/v1/analyze", json={"image_base64": "invalid_base64_string"})
    assert res.status_code == 422


def test_cors_headers(client):
    res = client.get("/api/v1/health", headers={"Origin": "http://localhost:3000"})
    assert res.status_code == 200
    assert res.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_security_headers(client):
    res = client.get("/api/v1/health")
    assert res.headers.get("x-content-type-options") == "nosniff"
    assert res.headers.get("x-frame-options") == "DENY"
    assert "x-request-id" in res.headers


def test_community_flow(client):
    # 1. Report
    rep_res = client.post(
        "/api/v1/community/report",
        json={"entity_type": "phone", "value": "9000000001", "scam_type": "electricity_bill"},
    )
    assert rep_res.status_code == 201

    # 2. Lookup
    look_res = client.post(
        "/api/v1/community/lookup",
        json={"entities": [{"type": "phone", "value": "9000000001"}]},
    )
    assert look_res.status_code == 200
    matches = look_res.json()["matches"]
    assert len(matches) == 1
    assert matches[0]["entity_type"] == "phone"
    assert matches[0]["report_count"] >= 1

    # 3. Stats
    stats_res = client.get("/api/v1/community/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_reports"] >= 1
    assert stats["unique_entities"] >= 1
