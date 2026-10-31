"""HTML renderers for the Scam Shield UI.

Every value that comes from a message, an LLM or an external API is escaped
before it is placed in HTML. The UI never opens a suspicious URL; links in
reports are limited to the two official reporting destinations.
"""

from __future__ import annotations

import html
import json
from typing import Any, Iterable

from ui import i18n, theme
from ui.adapter import STAGE_KEYS, STAGES

AGENT_ICONS: dict[str, str] = {
    "extractor": "🔎",
    "pattern_analyst": "🧠",
    "entity_checker": "🌐",
    "judge": "⚖️",
    "advisor": "🛟",
}
SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def esc(value: Any) -> str:
    """Escape any value for safe interpolation into HTML."""
    return html.escape("" if value is None else str(value), quote=True)


def _dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _clip(value: Any, limit: int = 700) -> str:
    text = str(value or "").strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def _display(value: Any) -> str:
    if isinstance(value, dict):
        for key in ("url", "upi_id", "phone", "number", "domain"):
            if value.get(key):
                return str(value[key])
        return json.dumps(value, ensure_ascii=False)[:160]
    return str(value)


def _tokens(items: Iterable[Any], empty: str, css: str = "") -> str:
    values = [item for item in items if str(item).strip()]
    if not values:
        return f'<span class="ss-meta">{esc(empty)}</span>'
    return "".join(
        f'<span class="ss-token {css}">{esc(_clip(_display(item), 120))}</span>' for item in values
    )


def hero(language: str, demo: bool = False, demo_reason: str = "") -> str:
    """Render the hero band with the shield mark and demo badge."""
    demo_html = ""
    if demo:
        reason_key = "demo_reason_forced"
        if demo_reason == "no_key":
            reason_key = "demo_reason_no_key"
        elif demo_reason == "import":
            reason_key = "demo_reason_import"
        demo_html = (
            f'<span class="ss-demo-badge" title="{esc(i18n.t(reason_key, language))}">'
            f'<span class="ss-demo-dot"></span>{esc(i18n.t("demo_badge", language))}</span>'
        )
    shield = (
        '<svg class="ss-shield" viewBox="0 0 64 72" role="img" aria-label="Shield">'
        "<defs><linearGradient id=\"ssg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">"
        '<stop offset="0%" stop-color="#a855f7"/><stop offset="60%" stop-color="#8b5cf6"/>'
        '<stop offset="100%" stop-color="#ec4899"/></linearGradient></defs>'
        '<path d="M32 3 58 13v22c0 16-10.5 27.2-26 34C16.5 62.2 6 51 6 35V13L32 3Z" '
        'fill="url(#ssg)" opacity=".20" stroke="url(#ssg)" stroke-width="2.4"/>'
        '<path d="M32 15v30M20 30l12 12 12-12" fill="none" stroke="url(#ssg)" '
        'stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'
        "</svg>"
    )
    badge = i18n.t("hero_badge_fast", language)
    badge2 = i18n.t("hero_badge_private", language)
    badge3 = i18n.t("hero_badge_lang", language)
    return f"""
    <section class="ss-hero" aria-label="{esc(i18n.t('brand', language))}">
      <div class="ss-hero-top">
        {shield}
        <div style="min-width:0;flex:1 1 420px">
          <h1>{esc(i18n.t('hero_title', language))}</h1>
        </div>
        {demo_html}
      </div>
      <p>{esc(i18n.t('hero_subtitle', language))}</p>
      <div class="ss-hero-badges">
        <span class="ss-pill">⚡ <strong>{esc(badge)}</strong></span>
        <span class="ss-pill">🔒 <strong>{esc(badge2)}</strong></span>
        <span class="ss-pill">🗣️ <strong>{esc(badge3)}</strong></span>
      </div>
    </section>
    """


def section_head(title: str, subtitle: str = "") -> str:
    """Render a section heading."""
    sub = f'<p class="ss-section-sub">{esc(subtitle)}</p>' if subtitle else ""
    return (
        '<div class="ss-section-head">'
        f'<h2 class="ss-section-title">{esc(title)}</h2>{sub}'
        "</div>"
    )


def _latest_events(events: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """Collapse an event stream into the latest event per agent."""
    latest: dict[str, dict[str, Any]] = {}
    for event in events or []:
        if not isinstance(event, dict):
            continue
        stage = str(event.get("stage", ""))
        if stage in STAGES:
            latest[stage] = event
        elif stage == "complete" and isinstance(event.get("data"), dict):
            result = event["data"]
            for pending in STAGES:
                current = latest.get(pending, {})
                if current.get("status") in (None, "running", "waiting"):
                    data = result.get(STAGE_KEYS[pending], {})
                    status = "done"
                    if isinstance(data, dict) and str(data.get("status", "")).lower() == "could_not_check":
                        status = "could_not_check"
                    latest[pending] = {"stage": pending, "status": status, "data": data}
    return latest


def _status_of(event: dict[str, Any]) -> str:
    status = str(event.get("status", "waiting")).lower()
    data = _dict(event.get("data"))
    if status == "done" and str(data.get("status", "")).lower() == "could_not_check":
        return "could_not_check"
    return status if status in ("waiting", "running", "done", "could_not_check", "error") else "waiting"


def _status_chip(status: str, language: str) -> str:
    key = {
        "waiting": "status_waiting",
        "running": "status_running",
        "done": "status_done",
        "could_not_check": "status_could_not_check",
        "error": "status_could_not_check",
    }.get(status, "status_waiting")
    marker = '<span class="ss-spinner"></span>' if status == "running" else '<span class="ss-status-dot"></span>'
    return f'<span class="ss-status is-{esc(status)}">{marker}{esc(i18n.t(key, language))}</span>'


def _extractor_detail(data: dict[str, Any], language: str) -> str:
    extracted = _dict(data)
    sender = extracted.get("sender")
    claimed = extracted.get("claimed_organisation")
    rows = [
        ("sender", sender or i18n.t("none_found", language)),
        ("claimed", claimed or i18n.t("none_found", language)),
    ]
    kv = "".join(
        f'<div class="ss-kv"><span class="ss-kv-label">{esc(i18n.t(label, language))}</span>'
        f'<span>{esc(_clip(value, 180))}</span></div>'
        for label, value in rows
    )
    links = _tokens(_list(extracted.get("urls")), i18n.t("none_found", language), "is-warn")
    phones = _tokens(_list(extracted.get("phone_numbers")), i18n.t("none_found", language))
    upi = _tokens(_list(extracted.get("upi_ids")), i18n.t("none_found", language))
    summary = _clip(extracted.get("summary"), 260)
    summary_html = (
        f'<div class="ss-kv"><span class="ss-kv-label">{esc(i18n.t("summary", language))}</span>'
        f"<span>{esc(summary)}</span></div>"
        if summary
        else ""
    )
    return (
        '<div class="ss-agent-detail">'
        f"{kv}"
        f'<div class="ss-kv"><span class="ss-kv-label">{esc(i18n.t("links", language))}</span>{links}</div>'
        f'<div class="ss-kv"><span class="ss-kv-label">{esc(i18n.t("phones", language))}</span>{phones}</div>'
        f'<div class="ss-kv"><span class="ss-kv-label">{esc(i18n.t("upi", language))}</span>{upi}</div>'
        f"{summary_html}"
        "</div>"
    )


def _pattern_detail(data: dict[str, Any], language: str) -> str:
    report = _dict(data)
    try:
        score = max(0, min(100, int(report.get("score", 0) or 0)))
    except (TypeError, ValueError):
        score = 0
    tactics = _list(report.get("tactics"))
    chips = "".join(
        f'<span class="ss-chip">{esc(i18n.t("tactic_" + str(tactic), language))}</span>'
        for tactic in tactics
    )
    if not chips:
        chips = f'<span class="ss-meta">{esc(i18n.t("no_tactics", language))}</span>'
    reasons = "".join(f"<li>{esc(_clip(reason, 220))}</li>" for reason in _list(report.get("reasons"))[:3])
    reasons_html = f'<ul class="ss-list is-compact">{reasons}</ul>' if reasons else ""
    note = ""
    if str(report.get("status", "")).lower() == "could_not_check":
        note = f'<div class="ss-meta">{esc(i18n.t("status_could_not_check", language))}</div>'
    return (
        '<div class="ss-agent-detail">'
        f'<div class="ss-score-row"><span class="ss-meta">{esc(i18n.t("score", language))}</span>'
        f'<span class="ss-scorebar"><span class="ss-scorefill" style="width:{score}%"></span></span>'
        f'<span class="ss-score-num">{score}/100</span></div>'
        f'<div class="ss-chips">{chips}</div>'
        f"{reasons_html}{note}"
        "</div>"
    )


def _entity_detail(data: dict[str, Any], language: str) -> str:
    report = _dict(data)
    findings = [item for item in _list(report.get("findings")) if isinstance(item, dict)]
    findings.sort(key=lambda item: SEVERITY_ORDER.get(str(item.get("severity", "medium")), 1))
    if findings:
        rows = []
        for finding in findings[:6]:
            severity = str(finding.get("severity", "medium")).lower()
            if severity not in SEVERITY_ORDER:
                severity = "medium"
            entity = _clip(_display(finding.get("entity")), 120)
            signal = _clip(finding.get("signal"), 240)
            source = _clip(finding.get("source"), 60)
            rows.append(
                '<div class="ss-finding">'
                f'<span class="ss-sev {esc(severity)}" aria-hidden="true"></span>'
                "<div>"
                f'<div class="ss-finding-signal">{esc(signal)}</div>'
                f'<div class="ss-finding-meta">{esc(entity)} · {esc(i18n.t("severity_" + severity, language))}'
                f"{(' · ' + esc(source)) if source else ''}</div>"
                "</div></div>"
            )
        body = "".join(rows)
    else:
        body = f'<div class="ss-meta">{esc(i18n.t("no_findings", language))}</div>'

    unchecked = [item for item in _list(report.get("unchecked")) if str(item).strip()]
    unchecked_html = ""
    if unchecked:
        items = "".join(f"<li>{esc(_clip(item, 140))}</li>" for item in unchecked[:5])
        unchecked_html = (
            f'<div class="ss-kv" style="margin-top:10px"><span class="ss-kv-label">'
            f'{esc(i18n.t("unchecked", language))}</span></div>'
            f'<ul class="ss-list is-compact">{items}</ul>'
        )
    if str(report.get("status", "")).lower() == "could_not_check":
        body = f'<div class="ss-token is-warn">{esc(i18n.t("status_could_not_check", language))}</div>' + body
    return f'<div class="ss-agent-detail">{body}{unchecked_html}</div>'


def _judge_detail(data: dict[str, Any], language: str) -> str:
    verdict = _dict(data)
    reasoning = _clip(verdict.get("reasoning"), 800)
    reasoning_html = (
        f'<div class="ss-kv"><span class="ss-kv-label">{esc(i18n.t("reasoning", language))}</span>'
        f"<span>{esc(reasoning)}</span></div>"
        if reasoning
        else ""
    )
    conflicts = [item for item in _list(verdict.get("conflicts")) if isinstance(item, dict)]
    if conflicts:
        items = "".join(
            '<div class="ss-conflict-item">'
            f'<div class="ss-conflict-desc">{esc(_clip(item.get("description"), 320))}</div>'
            f'<div class="ss-conflict-res">{esc(_clip(item.get("resolution"), 320))}</div>'
            "</div>"
            for item in conflicts[:3]
        )
        conflict_html = (
            '<div class="ss-conflict">'
            f'<div class="ss-conflict-title">⚖ {esc(i18n.t("conflicts", language))}</div>'
            f"{items}</div>"
        )
    else:
        conflict_html = f'<div class="ss-meta">{esc(i18n.t("no_conflicts", language))}</div>'

    evidence = [item for item in _list(verdict.get("key_evidence")) if str(item).strip()]
    evidence_html = ""
    if evidence:
        items = "".join(f"<li>{esc(_clip(item, 220))}</li>" for item in evidence[:4])
        evidence_html = (
            f'<ul class="ss-list is-compact" style="margin-top:10px">{items}</ul>'
        )
    return f'<div class="ss-agent-detail">{reasoning_html}{conflict_html}{evidence_html}</div>'


def _advisor_detail(data: dict[str, Any], language: str) -> str:
    advice = _dict(data)
    headline = _clip(advice.get("headline"), 260)
    summary = _clip(advice.get("plain_summary"), 500)
    do_next = [item for item in _list(advice.get("do_next")) if str(item).strip()][:3]
    steps = "".join(f"<li>{esc(_clip(item, 180))}</li>" for item in do_next)
    steps_html = f'<ul class="ss-list is-compact">{steps}</ul>' if steps else ""
    return (
        '<div class="ss-agent-detail">'
        f'<div class="ss-finding-signal">{esc(headline)}</div>'
        f'<div class="ss-meta" style="margin-top:6px">{esc(summary)}</div>'
        f"{steps_html}"
        "</div>"
    )


def agent_cards(events: list[dict[str, Any]], language: str) -> str:
    """Render the five live agent cards."""
    latest = _latest_events(events)
    cards: list[str] = []
    for stage in STAGES:
        event = latest.get(stage, {})
        status = _status_of(event) if event else "waiting"
        data = _dict(event.get("data"))
        name = i18n.t(f"stage_{stage}", language)
        desc = i18n.t(f"desc_{stage}", language)
        detail = ""
        if status in ("done", "could_not_check") and data:
            renderer = {
                "extractor": _extractor_detail,
                "pattern_analyst": _pattern_detail,
                "entity_checker": _entity_detail,
                "judge": _judge_detail,
                "advisor": _advisor_detail,
            }[stage]
            detail = renderer(data, language)
        cards.append(
            f'<article class="ss-agent is-{esc(status)}" role="listitem" '
            f'aria-label="{esc(name)}: {esc(i18n.t("status_" + ("could_not_check" if status in ("could_not_check", "error") else status), language))}">'
            f'<div class="ss-agent-icon" aria-hidden="true">{AGENT_ICONS[stage]}</div>'
            '<div class="ss-agent-main">'
            f'<div class="ss-agent-title">{esc(name)}</div>'
            f'<div class="ss-agent-desc">{esc(desc)}</div>'
            f"{detail}"
            "</div>"
            f"{_status_chip(status, language)}"
            "</article>"
        )
    return (
        '<div class="ss-pipeline" role="list" aria-live="polite">'
        + "".join(cards)
        + "</div>"
    )


def _int_confidence(value: Any) -> int:
    try:
        return max(0, min(100, int(float(value))))
    except (TypeError, ValueError):
        return 0


def _evidence_for(result: dict[str, Any], language: str) -> list[str]:
    verdict = _dict(result.get("verdict"))
    evidence = [str(item) for item in _list(verdict.get("key_evidence")) if str(item).strip()]
    if evidence:
        return evidence[:4]
    entity = _dict(result.get("entity"))
    findings = [item for item in _list(entity.get("findings")) if isinstance(item, dict)]
    findings.sort(key=lambda item: SEVERITY_ORDER.get(str(item.get("severity", "medium")), 1))
    derived = [str(item.get("signal", "")) for item in findings[:4] if item.get("signal")]
    if derived:
        return derived
    pattern = _dict(result.get("pattern"))
    reasons = [str(item) for item in _list(pattern.get("reasons")) if str(item).strip()]
    return reasons[:3]


def verdict_panel(result: dict[str, Any], language: str) -> str:
    """Render the colour-coded verdict, confidence, evidence and next steps."""
    payload = _dict(result)
    verdict = _dict(payload.get("verdict"))
    advice = _dict(payload.get("advice"))
    verdict_key = str(verdict.get("verdict", "suspicious")).lower()
    if verdict_key not in ("safe", "suspicious", "scam"):
        verdict_key = "suspicious"
    meta = theme.verdict_meta(verdict_key)
    confidence = _int_confidence(verdict.get("confidence", 0))
    headline = _clip(advice.get("headline") or i18n.t(f"verdict_{verdict_key}", language), 260)
    summary = _clip(advice.get("plain_summary"), 700)
    evidence = _evidence_for(payload, language)
    evidence_html = ""
    if evidence:
        items = "".join(f"<li>{esc(_clip(item, 240))}</li>" for item in evidence)
        evidence_html = (
            '<div class="ss-evidence">'
            f'<div class="ss-evidence-title">{esc(i18n.t("key_evidence", language))}</div>'
            f"<ul>{items}</ul></div>"
        )

    do_not = [str(item) for item in _list(advice.get("do_not")) if str(item).strip()][:3]
    do_next = [str(item) for item in _list(advice.get("do_next")) if str(item).strip()][:3]
    do_not_items = "".join(f"<li>{esc(_clip(item, 220))}</li>" for item in do_not)
    do_next_items = "".join(f"<li>{esc(_clip(item, 220))}</li>" for item in do_next)
    actions = ""
    if do_not or do_next:
        actions = (
            '<div class="ss-actions">'
            '<div class="ss-action-card is-do-not">'
            f'<div class="ss-action-title">✕ {esc(i18n.t("do_not", language))}</div>'
            f"<ul>{do_not_items}</ul></div>"
            '<div class="ss-action-card is-do">'
            f'<div class="ss-action-title">✓ {esc(i18n.t("do_next", language))}</div>'
            f"<ul>{do_next_items}</ul></div>"
            "</div>"
        )

    timings = _dict(payload.get("timings_ms"))
    total_ms = timings.get("total")
    try:
        timing_text = i18n.t("analyzed_in", language, ms=int(float(total_ms)))
    except (TypeError, ValueError):
        timing_text = i18n.t("fresh", language)
    cached_text = i18n.t("cached", language) if payload.get("cache_hit") else i18n.t("fresh", language)

    label = i18n.t(f"verdict_{verdict_key}", language)
    icon = meta.get("icon", "!")
    return f"""
    <section class="ss-verdict" role="status" aria-live="polite"
      style="--verdict-color:{meta['color']};--verdict-soft:{meta['soft']};--gauge-color:{meta['color']}">
      <div class="ss-verdict-head">
        <div>
          <div class="ss-verdict-kicker">
            <span class="ss-verdict-mark" aria-hidden="true">{esc(icon)}</span>
            {esc(i18n.t('verdict_kicker', language))} · {esc(label)}
          </div>
          <h2 class="ss-verdict-headline">{esc(headline)}</h2>
          <p class="ss-verdict-summary">{esc(summary)}</p>
        </div>
        <div class="ss-gauge" style="--conf:{confidence}" role="img"
          aria-label="{esc(i18n.t('confidence', language))}: {confidence}%">
          <div class="ss-gauge-inner">
            <div class="ss-gauge-value">{confidence}%</div>
            <div class="ss-gauge-label">{esc(i18n.t('confidence', language))}</div>
          </div>
        </div>
      </div>
      {evidence_html}
      {actions}
      <div class="ss-report">
        <a href="tel:1930" aria-label="{esc(i18n.t('helpline', language))}">📞 {esc(i18n.t('helpline', language))}</a>
        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">🌐 {esc(i18n.t('cybercrime', language))}</a>
      </div>
      <div class="ss-verdict-foot">
        <span class="ss-meta">{esc(cached_text)} · {esc(timing_text)}</span>
        <span class="ss-meta">{esc(i18n.t('report_help', language))}</span>
      </div>
    </section>
    """


def voice_component(advice: dict[str, Any], language: str) -> str:
    """Return an iframe body that reads the advice with browser speech synthesis."""
    advice = _dict(advice)
    advice_lang = str(advice.get("language", language))
    speech_lang = "hi-IN" if advice_lang == "hi" or language == "hi" else "en-IN"
    parts = [str(advice.get("headline", "")), str(advice.get("plain_summary", ""))]
    parts += [f"Don't: {item}" if speech_lang == "en-IN" else f"न करें: {item}" for item in _list(advice.get("do_not"))[:3]]
    parts += [f"Do: {item}" if speech_lang == "en-IN" else f"करें: {item}" for item in _list(advice.get("do_next"))[:3]]
    parts += ["Helpline 1930.", "Cybercrime dot gov dot in."] if speech_lang == "en-IN" else ["हेल्पलाइन 1930।", "साइबर क्राइम डॉट gov डॉट in।"]
    speech = " ".join(part for part in parts if part.strip())
    payload = json.dumps(speech, ensure_ascii=False).replace("</", "<\\/")
    label = i18n.t("voice_play", language)
    stop = i18n.t("voice_stop", language)
    unsupported = i18n.t("sound_unsupported", language)
    hint = i18n.t("listen_hint", language)
    return f"""
    <style>
      html, body {{ margin:0; padding:0; background:transparent; font-family:'Manrope','Noto Sans Devanagari',sans-serif; }}
      .wrap {{ display:flex; align-items:center; gap:12px; padding:4px 2px; }}
      button {{ display:inline-flex; align-items:center; gap:8px; border-radius:999px; border:1px solid #3a4160;
        background:#1a1f34; color:#f6f7ff; font-weight:700; font-size:13px; padding:9px 15px; cursor:pointer; }}
      button:hover {{ border-color:#8b5cf6; }}
      button:focus-visible {{ outline:3px solid rgba(34,211,238,.65); outline-offset:2px; }}
      .hint {{ color:#6f7893; font-size:11px; line-height:1.35; }}
      .state {{ color:#9aa3bd; font-size:12px; }}
    </style>
    <div class="wrap">
      <button id="speak" type="button" aria-label="{esc(label)}">🔊 <span id="label">{esc(label)}</span></button>
      <span class="hint">{esc(hint)}</span>
    </div>
    <script>
      (function () {{
        var text = {payload};
        var button = document.getElementById('speak');
        var label = document.getElementById('label');
        var hint = document.querySelector('.hint');
        var original = {json.dumps(label, ensure_ascii=False)};
        var stopLabel = {json.dumps(stop, ensure_ascii=False)};
        if (!('speechSynthesis' in window)) {{
          button.disabled = true;
          hint.textContent = {json.dumps(unsupported, ensure_ascii=False)};
          return;
        }}
        var speaking = false;
        button.addEventListener('click', function () {{
          if (speaking) {{
            window.speechSynthesis.cancel();
            speaking = false;
            label.textContent = original;
            return;
          }}
          window.speechSynthesis.cancel();
          var msg = new SpeechSynthesisUtterance(text);
          msg.lang = {json.dumps(speech_lang)};
          msg.rate = 0.94;
          msg.pitch = 1;
          msg.onend = function () {{ speaking = false; label.textContent = original; }};
          msg.onerror = function () {{ speaking = false; label.textContent = original; }};
          speaking = true;
          label.textContent = stopLabel;
          window.speechSynthesis.speak(msg);
        }});
      }})();
    </script>
    """


def report_json(result: dict[str, Any]) -> str:
    """Serialise the full result for download."""
    try:
        return json.dumps(result, ensure_ascii=False, indent=2)
    except (TypeError, ValueError):
        return json.dumps({"error": "report could not be serialised"}, indent=2)


def report_text(result: dict[str, Any], language: str) -> str:
    """Build a plain-text report that is readable without the app."""
    payload = _dict(result)
    verdict = _dict(payload.get("verdict"))
    advice = _dict(payload.get("advice"))
    verdict_key = str(verdict.get("verdict", "suspicious")).lower()
    label = i18n.t(f"verdict_{verdict_key}" if verdict_key in ("safe", "suspicious", "scam") else "verdict_suspicious", language)
    lines = [
        f"SCAM SHIELD REPORT — {label}",
        f"Confidence: {verdict.get('confidence', 0)}%",
        "",
        f"Headline: {advice.get('headline', '')}",
        f"Summary: {advice.get('plain_summary', '')}",
        "",
        "KEY EVIDENCE",
    ]
    evidence = _evidence_for(payload, language)
    lines += [f"- {item}" for item in evidence] or ["- No evidence available."]
    lines += ["", "DO NOT"]
    lines += [f"- {item}" for item in _list(advice.get("do_not"))[:3]] or ["- No specific actions listed."]
    lines += ["", "DO NEXT"]
    lines += [f"- {item}" for item in _list(advice.get("do_next"))[:3]] or ["- No specific actions listed."]
    lines += [
        "",
        "REPORT",
        "- National Cyber Crime Helpline: 1930",
        "- cybercrime.gov.in",
        "",
        "This is an AI-assisted advisory, not a legal or financial guarantee.",
    ]
    return "\n".join(lines)


def demo_badge(language: str, reason: str = "forced") -> str:
    """Render a compact demo badge for the sidebar/hero."""
    key = "demo_reason_forced"
    if reason == "no_key":
        key = "demo_reason_no_key"
    elif reason == "import":
        key = "demo_reason_import"
    return (
        f'<div class="ss-side-warning"><strong>{esc(i18n.t("demo_badge", language))}</strong><br>'
        f"{esc(i18n.t(key, language))}</div>"
    )


def sidebar_intro(language: str) -> str:
    """Static sidebar content shown above the controls."""
    steps = "".join(
        f'<div class="ss-side-step"><span class="ss-side-step-num">{index + 1}</span>'
        f"<span><strong>{esc(i18n.t(f'stage_{stage}', language))}</strong><br>"
        f"{esc(i18n.t(f'desc_{stage}', language))}</span></div>"
        for index, stage in enumerate(STAGES)
    )
    return f"""
    <div class="ss-brand">
      <div class="ss-agent-icon" aria-hidden="true">🛡️</div>
      <div>
        <div class="ss-brand-name">{esc(i18n.t('brand', language))}</div>
        <div class="ss-brand-sub">{esc(i18n.t('brand_sub', language))}</div>
      </div>
    </div>
    <div class="ss-side-block">
      <div class="ss-side-title">{esc(i18n.t('sidebar_about', language))}</div>
      <div class="ss-side-text">{esc(i18n.t('about_text', language))}</div>
    </div>
    <div class="ss-side-block">
      <div class="ss-side-title">{esc(i18n.t('sidebar_how', language))}</div>
      {steps}
    </div>
    """


def sidebar_outro(language: str) -> str:
    """Disclaimer and credits shown below the sidebar controls."""
    return f"""
    <div class="ss-side-block">
      <div class="ss-side-title">{esc(i18n.t('sidebar_disclaimer', language))}</div>
      <div class="ss-side-warning">{esc(i18n.t('disclaimer_text', language))}</div>
    </div>
    <div class="ss-side-block">
      <div class="ss-side-title">{esc(i18n.t('sidebar_credits', language))}</div>
      <div class="ss-side-text" style="margin-bottom:8px">{esc(i18n.t('credits_text', language))}</div>
      <div class="ss-credits">
        <span class="ss-credit">Streamlit</span><span class="ss-credit">Python</span>
        <span class="ss-credit">Gemini</span><span class="ss-credit">Groq</span>
        <span class="ss-credit">VirusTotal</span><span class="ss-credit">Safe Browsing</span>
        <span class="ss-credit">URLhaus</span><span class="ss-credit">WHOIS</span>
        <span class="ss-credit">tldextract</span><span class="ss-credit">rapidfuzz</span>
      </div>
    </div>
    """


def empty_verdict(language: str) -> str:
    """Friendly placeholder shown before the first analysis."""
    return f"""
    <div class="ss-empty">
      <div class="ss-empty-icon" aria-hidden="true">🕵️</div>
      <h3>{esc(i18n.t('verdict_empty_title', language))}</h3>
      <p>{esc(i18n.t('verdict_empty_body', language))}</p>
    </div>
    """


def error_panel(language: str) -> str:
    """Friendly error state; raw exceptions never reach the browser."""
    return f"""
    <div class="ss-error" role="alert">
      <div class="ss-error-icon" aria-hidden="true">⚠</div>
      <h3>{esc(i18n.t('error_title', language))}</h3>
      <p>{esc(i18n.t('error_body', language))}</p>
    </div>
    """


def footer(language: str) -> str:
    """Render the legal footer."""
    return f'<div class="ss-foot">{esc(i18n.t("footer", language))}</div>'
