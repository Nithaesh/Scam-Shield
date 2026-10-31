# Phase 0: Discovery & Architecture Baseline

**Project**: Scam Shield v2  
**Baseline Test Count**: **125 passed in 5.69s** (Executed via `pytest -q` on branch `feat/v2-upgrade`)  
**Timestamp**: 2026-10-31  

---

## 1. Orchestrator Entry Points & Signatures

The core pipeline is defined in `orchestrator.py`:

```python
def analyse(
    input_data: str | bytes | Path,
    language: Literal["auto", "en", "hi"] = "auto",
) -> AnalysisResult:
    ...

def analyse_stream(
    input_data: str | bytes | Path,
    language: Literal["auto", "en", "hi"] = "auto",
) -> Generator[dict[str, Any], None, AnalysisResult]:
    ...
```

- **Execution Model**: Synchronous generator and function.
- **Input Types**:
  - `str`: Raw text message (SMS, WhatsApp, UPI prompt, email).
  - `bytes`: Raw image bytes (PNG, JPEG, WebP).
  - `Path`: Local path to image file or text file.
- **Language Parameter**: `"auto"` | `"en"` | `"hi"`. Controls advice generation target language.

---

## 2. Real Orchestrator Event Types and Payload Shapes

When consuming `analyse_stream`, the generator yields dictionaries in the following format:

```python
{"stage": "cache", "status": "checking"}
{"stage": "cache", "status": "done", "data": <AnalysisResult dict>}  # If cache hit, completes immediately

# If fresh execution:
{"stage": "extractor", "status": "running"}
{"stage": "extractor", "status": "done", "data": <Extracted dict>}

# Parallel stage 2:
{"stage": "pattern_analyst", "status": "running"}
{"stage": "entity_checker", "status": "running"}
{"stage": "pattern_analyst", "status": "done", "data": <PatternReport dict>}
{"stage": "entity_checker", "status": "done", "data": <EntityReport dict>}

# Stage 3 Judge:
{"stage": "judge", "status": "running"}
{"stage": "judge", "status": "done", "data": <JudgeVerdict dict>}

# Stage 4 Advisor:
{"stage": "advisor", "status": "running"}
{"stage": "advisor", "status": "done", "data": <Advice dict>}

# Completion:
{"stage": "complete", "status": "done", "data": <AnalysisResult dict>}
```

---

## 3. Pydantic Core Schemas (`agents/schemas.py`)

### `Extracted`
- `sender`: `str | None` (Sender name, phone, or TRAI alphanumeric header)
- `message_text`: `str` (Cleaned text or OCR text)
- `urls`: `list[str]`
- `phone_numbers`: `list[str]`
- `upi_ids`: `list[str]`
- `language`: `"en" | "hi" | "hinglish" | "other"`
- `claimed_organisation`: `str | None`
- `summary`: `str`

### `PatternReport`
- `status`: `"ok" | "could_not_check"`
- `score`: `int` (0 to 100)
- `tactics`: `list[TacticType]` (`"urgency"`, `"fear"`, `"impersonation"`, `"otp_request"`, `"pin_request"`, `"click_pressure"`, `"prize_lure"`, `"kyc_threat"`, `"payment_request"`, `"remote_access_request"`, `"job_offer_lure"`)
- `impersonated_entity`: `str | None`
- `reasons`: `list[str]`

### `EntityReport`
- `status`: `"ok" | "could_not_check"`
- `risk_score`: `int` (0 to 100)
- `findings`: `list[EntityFinding]` (`entity`, `type`, `signal`, `severity: low|medium|high`, `source`)
- `reasons`: `list[str]`
- `unchecked`: `list[str]`

### `JudgeVerdict`
- `verdict`: `"safe" | "suspicious" | "scam"`
- `confidence`: `int` (0 to 100)
- `reasoning`: `str`
- `conflicts`: `list[Conflict]` (`description`, `resolution`)
- `key_evidence`: `list[str]`

### `Advice`
- `language`: `"en" | "hi"`
- `headline`: `str`
- `do_not`: `list[str]` (max 3 items)
- `do_next`: `list[str]` (max 3 items)
- `report_to`: `list[str]` (e.g. `["National Cyber Crime Helpline: 1930", "cybercrime.gov.in"]`)
- `plain_summary`: `str`

### `AnalysisResult`
- `extracted`: `Extracted`
- `pattern`: `PatternReport`
- `entity`: `EntityReport`
- `verdict`: `JudgeVerdict`
- `advice`: `Advice`
- `timings_ms`: `dict[str, float]`
- `cache_hit`: `bool`

---

## 4. How Language and Images are Passed

- **Images**: In `orchestrator.py`, if `input_data` is `bytes`, MIME detection or `image_mime_type` defaults to `image/png` or `image/jpeg`. `agents/extractor.py` accepts `image: bytes` and `image_mime_type: str`, using Gemini Flash multimodal vision (`Part.from_bytes(data=image, mime_type=image_mime_type)`). Groq does not support image analysis, so image analysis strictly relies on Gemini Flash.
- **Language**: Passed as `language: "auto" | "en" | "hi"`. Extractor detects input text language (`en`, `hi`, `hinglish`, `other`). Advisor produces final guidance in the requested language or autodetected language.

---

## 5. Cache Behavior

- Location: Root `cache/<sha256_hash>.json`.
- Hashing: `_compute_input_hash(input_data)` computes SHA-256 over normalized whitespace (`" ".join(text.strip().split())`).
- When a cache hit occurs, `AnalysisResult.cache_hit = True` and returns in ~0.3ms without spending tokens.
- Language Localization on Cache Hit: If cached advice is in English and the user requests `"hi"`, only Stage 4 (`advise`) is re-run, keeping the verdict and confidence 100% stable while updating advice in ~20ms.

---

## 6. How `could_not_check` Works (Fail-Safe Principle)

- If any component (e.g., WHOIS lookup, reputation API, or pattern analyst) fails or times out, it returns a typed fallback with `status="could_not_check"`.
- Rule: **An unchecked target is NEVER reported as clean or safe.** If key indicators cannot be checked, the Judge degrades the verdict to `"suspicious"` rather than `"safe"`, and documents the unchecked items in `EntityReport.unchecked` and `JudgeVerdict.reasoning`.

---

## 7. Gaps Between v2 Spec & Existing Code (Bridge Handling)

| v2 Specification Requirement | Existing Code Reality | How v2 Bridge (`v2/api/services/`) Handles It |
| :--- | :--- | :--- |
| **Async Streaming via SSE** (`text/event-stream`) | `orchestrator.analyse_stream` is a synchronous blocking Python generator | `v2/api/services/pipeline.py` executes `analyse_stream` in a dedicated worker thread via `queue.Queue`, yielding async SSE chunks with 10s heartbeats. |
| **Enriched Scam Taxonomy** (`scam_type`: `bank_kyc`, `electricity_bill`, etc.) | Existing Judge outputs high-level verdict (`safe`, `suspicious`, `scam`), not fine-grained taxonomy enum | `v2/api/services/scam_taxonomy.py` deterministically maps verdict reasoning, tactics, and entities to the 12 canonical scam taxonomy categories. |
| **Forwardable Family WhatsApp Share Text** (`share_text` <= 280 chars) | Existing `Advice` model does not generate pre-formatted WhatsApp share strings | `v2/api/services/share_text.py` formats localized, empathetic, privacy-safe 280-char warnings mentioning 1930 and Scam Shield without echoing the user's phone number. |
| **Direct SSE Contract Fields** (`llm_provider`, `tools_used`, `duration_ms`) | Raw orchestrator events yield data dicts without explicit provider/tools metadata | `v2/api/services/pipeline.py` wraps each stage event, attributing provider (`gemini` vs `groq`) and tools used based on environment and findings. |
| **Image Validation & Base64 Ingestion** | Existing orchestrator takes raw bytes or Path directly | `v2/api/services/image_validation.py` decodes Base64, validates magic bytes (PNG/JPEG/WebP) with Pillow, limits to 5 MB and max 4000px, and strips EXIF. |
| **Community Reputation Database** (Optional SQLite/Postgres) | Existing system is stateless + local disk JSON cache | `v2/api/db/` provides optional privacy-preserving SHA-256 salted entity hashing and lookup when `COMMUNITY_ENABLED=true`. |
| **Per-IP Rate Limiting** | Existing system has no HTTP rate limiting layer | `v2/api/middleware/` uses `slowapi` to enforce 10 req/min for analyze and 5 req/hr for community reports. |

---

## 8. Baseline Recording

- **Command**: `pytest -q`
- **Result**: `125 passed in 5.69s`
- **Git Branch**: `feat/v2-upgrade`
