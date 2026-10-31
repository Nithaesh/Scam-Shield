# Scam Shield v2: API Contract Specification

**Version**: 1.0.0  
**Base Path**: `/api/v1`  
**Protocol**: HTTP/1.1 REST & Server-Sent Events (SSE)  

---

## 1. Endpoints

### 1.1 `GET /api/v1/health`
**Purpose**: System readiness and component telemetry.  
**Response (200 OK)**:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "gemini_configured": true,
  "groq_configured": true,
  "db_ok": true,
  "uptime_s": 42.5
}
```

### 1.2 `POST /api/v1/analyze`
**Purpose**: One-shot synchronous analysis.  
**Request**:
```json
{
  "text": "Dear customer your SBI account is blocked. Visit http://sbi-kyc.xyz",
  "image_base64": null,
  "image_mime": null,
  "language": "auto"
}
```

### 1.3 `POST /api/v1/analyze/stream`
**Purpose**: Streaming SSE events with stage-by-stage progression.  
**Content-Type**: `text/event-stream`  

#### Event Types:
- `pipeline_start`: `{"v": 1, "request_id": str, "stages": [...]}`
- `stage_start`: `{"v": 1, "request_id": str, "stage": str}`
- `stage_result`: `{"v": 1, "request_id": str, "stage": str, "status": "done"|"degraded"|"failed", "output": {...}, "duration_ms": float, "cached": bool, "llm_provider": str, "tools_used": [...]}`
- `conflict`: `{"v": 1, "request_id": str, "analyst_signal": str, "checker_signal": str, "winner": str, "resolution": str}`
- `final`: `{"v": 1, "request_id": str, "verdict": "safe"|"suspicious"|"scam", "confidence": float, "scam_type": str, "reasoning": str, "conflict": {...}|null, "advice": {...}, "share_text": str, "language": str, "entities": {...}, "community": {...}, "total_ms": float, "cached": bool}`
- `error`: `{"v": 1, "request_id": str, "stage": str|null, "code": str, "message": str, "degraded": bool}`

### 1.4 `GET /api/v1/samples`
**Purpose**: Read-only curated sample scenarios.  

### 1.5 Community Endpoints
- `POST /api/v1/community/report`
- `POST /api/v1/community/lookup`
- `GET /api/v1/community/stats`
