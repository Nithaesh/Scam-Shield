# Scam Shield — Frontend and Real Entity Tools

This document describes the two parts added on top of the teammate-owned
pipeline: the Streamlit frontend (`app.py`, `ui/`) and the real Entity Checker
tools (`tools/`, `tools_real.py`). No teammate-owned file was modified.

## 1. What was added

| Path | Purpose |
| --- | --- |
| `app.py` | Streamlit entry point: input, language, live cards, verdict, downloads |
| `ui/adapter.py` | The only bridge to `orchestrator.analyse` / `analyse_stream` |
| `ui/stub_orchestrator.py` | Offline demo stream with realistic scam/safe/suspicious cases |
| `ui/components.py` | Hero, agent cards, verdict banner, voice player, report HTML |
| `ui/i18n.py` | English/Hindi labels and UI-language resolution |
| `ui/samples.py` | Five demo messages, preferring the teammate's `data/` JSON |
| `ui/theme.py`, `ui/styles.css` | Design tokens and mobile-first styles |
| `.streamlit/config.toml` | Dark theme, 5 MB upload limit, minimal toolbar |
| `tools/` | Offline URL/WHOIS/reputation/phone/UPI/sender checks |
| `tools_real.py` | Thin shim re-exporting `tools.real.real_check_entities` |
| `tests/test_tools.py` | 116 offline tests for the real tools |

## 2. Run it

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # optional; add keys later
streamlit run app.py
```

Open <http://localhost:8501>. The app starts in demo mode when no LLM key is
configured, so it is usable immediately.

## 3. Modes

| Situation | Behaviour |
| --- | --- |
| `USE_STUB_UI=1` | Always use canned demo data |
| `USE_STUB_UI=0` | Always use the real agent pipeline |
| `USE_STUB_UI` unset, no `GEMINI_API_KEY`/`GROQ_API_KEY` | Demo mode, labelled "no LLM key" |
| `USE_STUB_UI` unset, key present, orchestrator imports | Real pipeline |
| Orchestrator import fails | Demo mode, labelled "orchestrator unavailable" |

The sidebar toggle overrides the default for the current session. When demo
mode is on, a second toggle simulates partially unavailable checks
(`could_not_check`) so the amber "partial" state can be shown safely.

Real mode uses the existing pipeline unchanged. `tools_interface.py` already
routes `USE_MOCK_TOOLS=0` to `from tools_real import real_check_entities`, so
the shim is all that is needed to plug in the real tools.

## 4. Frontend architecture

```
app.py
 ├─ ui.i18n        labels + auto language detection (Devanagari → Hindi)
 ├─ ui.components  pure HTML builders (escaped user content)
 ├─ ui.samples     data/scams.json + data/genuine.json, fictional fallback
 └─ ui.adapter
      ├─ ui.stub_orchestrator   canned stream (demo)
      └─ orchestrator           analyse_stream / analyse (real)
```

The adapter normalises every source into five agent events plus `complete`:

```python
{"stage": "extractor|pattern_analyst|entity_checker|judge|advisor",
 "status": "waiting|running|done|could_not_check|error",
 "data": {...}}
```

It handles the real `analyse_stream` quirks: cache hits are expanded into full
results, text streaming runs in a daemon thread with a hard deadline (180 s),
screenshots are written to a temporary `Path` and removed afterwards, and any
failure becomes a `could_not_check` card rather than a traceback. If streaming
fails mid-way, the adapter retries once through `analyse()` before showing the
error panel.

### UI features

- Five live agent cards with status, findings and confidence.
- Fixed verdict colours: green `#16a34a`, amber `#f59e0b`, red `#dc2626`.
  The Judge conflict box is shown when language and technical evidence disagree.
- Hindi/English UI toggle (Auto, English, Hindi). Changing the advice language
  after a verdict re-runs the analysis once so advice and labels agree.
- Read-aloud player for the advice, plus JSON and text report downloads.
- Mobile-first layout, keyboard-usable buttons, escaped message content.
- Screenshot upload (PNG/JPG, max 5 MB) through the image tab.
- Clear/Retry/Check-another flows; no raw exceptions reach the user.

### Privacy

The message stays in the Streamlit session. The UI never opens a link from a
message; `ui.components` renders links as text, not anchors.

## 5. Real Entity Checker tools

Entry point: `tools.real.real_check_entities(extracted)`, re-exported by
`tools_real.py` and called by `tools_interface.check_entities` when
`USE_MOCK_TOOLS=0`. It returns exactly the contract documented in
`tools_interface.py`:

- `urls[]`: `url, domain, tld, is_shortener, is_ip_based, lookalike_of,
  domain_age_days, virustotal, safe_browsing, urlhaus, errors`
- `phones[]`: `phone, is_valid_format, is_shortcode, carrier_type,
  scam_reports_count, reputation, errors`
- `upi[]`: `upi_id, handle, user, is_impersonation, target_entity,
  reputation, errors`
- `sender`: `raw_sender, is_official_header, header_entity,
  mismatch_with_claimed, errors`

### Checks performed

**URL analysis (offline).** Parses de-fanged links (`hxxp://`, `[.]`, `(dot)`),
decodes punycode/IDN, detects raw IPs and known shorteners, and compares each
host with a registry of ~70 Indian brands (banks, UPI apps, e-commerce,
telecom, government, logistics, utilities, media). Official domains and their
subdomains are allow-listed first, so `netbanking.hdfcbank.com` and
`amazon.co.uk` are never flagged. Lookalike detection also handles leet
substitutions (`amaz0n`), hyphenated prefixes (`sbi-kyc.xyz`), brand tokens in
subdomains and fuzzy matches. High-abuse TLDs are supporting context only.

**WHOIS age.** `python-whois` runs in a daemon thread with a five-second
budget. Failures return `domain_age_days=None` plus an error string.

**Reputation.** VirusTotal (existing report lookup, never a new scan), Google
Safe Browsing and URLhaus. A provider is contacted only when its key exists:
`VIRUSTOTAL_API_KEY`, `SAFE_BROWSING_API_KEY`, `URLHAUS_AUTH_KEY`. All requests
use a five-second timeout and run concurrently. Absent or failed providers
return `None` (not `"safe"`) and add a message to `errors`.

**Phones.** `phonenumbers` validates Indian numbers and classifies mobile,
landline, toll-free, premium and shortcode. There is no bundled phone-reputation
provider, so `scam_reports_count` stays `0` and a limitation note is added; the
tool never invents report counts. A personal mobile presented as an official
helpline is labelled `personal_mobile_claimed_official`.

**UPI.** Parses `user@handle` and `upi://pay?pa=...`, recognizes common PSP
handles, and flags handles impersonating a brand or using refund/KYC/support
bait (`sbi.kyc@paytm`, `refund.support@ybl`).

**Sender.** Validates six-character TRAI headers (with optional two-letter
operator prefix) and compares the header entity with the claimed organisation
to detect mismatch.

### Safety and limits

- The suspicious URL is never fetched, rendered or downloaded.
- At most five URLs, five phone numbers and five UPI IDs are checked per
  message; duplicates collapse case-insensitively.
- Each entity is checked inside its own guard: one crash cannot break the
  response, and every record keeps the full contract shape.
- API keys are read from the environment, never logged and never echoed into
  results.
- Network calls are limited to WHOIS and the reputation APIs above.

## 6. Tests

```powershell
.\.venv\Scripts\python.exe -m pytest -q            # 125 tests (9 teammate + 116 tools)
.\.venv\Scripts\python.exe -m pytest tests\test_tools.py -q
```

`tests/test_tools.py` is fully offline: WHOIS and every HTTP call are stubbed.
It covers 40+ lookalike cases, official-domain allow-listing, defanging/IDN,
WHOIS parsing and timeout, VirusTotal/Safe Browsing/URLhaus parsing and
timeouts, phone/UPI/sender matrices, all-failure shape, crash safety,
limits/deduplication, secret leakage, the CLI, and `USE_MOCK_TOOLS=0` routing.

Manual CLI check:

```powershell
.\.venv\Scripts\python.exe -m tools.real "http://sbi-kyc-update.xyz/login call 9876543210 pay sbi.kyc@paytm"
```

## 7. Known limitations

- No LLM or reputation keys are checked into the repo, so live LLM reasoning
  and VirusTotal/Safe Browsing/URLhaus results require the user's own keys.
- WHOIS may be blocked on some corporate or restricted networks; the tools
  degrade to an error string and the verdict still renders.
- There is no phone-reputation database integration; phone evidence is
  metadata and context only.
- The demo stub is keyword-driven. It is meant for demos, not as a classifier.
