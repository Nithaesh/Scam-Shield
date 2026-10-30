"""Scam Shield — Streamlit frontend.

Run with:  streamlit run app.py
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import streamlit as st
import streamlit.components.v1 as components
from dotenv import load_dotenv

load_dotenv()

from ui import adapter, components as ui, i18n, samples  # noqa: E402

logger = logging.getLogger("scam_shield.ui.app")
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(name)s: %(message)s")

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"png", "jpg", "jpeg"}
STYLE_PATH = Path(__file__).resolve().parent / "ui" / "styles.css"


def _inject_styles() -> None:
    """Load the design system once per rerun."""
    try:
        css = STYLE_PATH.read_text(encoding="utf-8")
    except OSError:
        logger.warning("styles.css could not be loaded")
        css = ""
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


def _init_state() -> None:
    """Initialise session state without clobbering user choices."""
    default_stub, reason = adapter.default_stub_mode()
    defaults: dict[str, Any] = {
        "message_input": "",
        "uploader_nonce": 0,
        "lang": "auto",
        "use_stub": default_stub,
        "stub_reason": reason,
        "simulate_partial": False,
        "events": [],
        "result": None,
        "error": False,
        "last_input": None,
        "last_image_name": None,
        "result_language": None,
        "retry_requested": False,
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)


def _ui_language() -> str:
    """Resolve the current UI language from the toggle and message text."""
    return i18n.resolve_ui_language(
        str(st.session_state.get("lang", "auto")),
        str(st.session_state.get("message_input", "")),
    )


def _clear_inputs() -> None:
    """Reset the input area and any previous analysis."""
    st.session_state.message_input = ""
    st.session_state.uploader_nonce = int(st.session_state.get("uploader_nonce", 0)) + 1
    _reset_result()


def _reset_result() -> None:
    """Forget the current analysis (used by Clear / Check another)."""
    st.session_state.events = []
    st.session_state.result = None
    st.session_state.error = False
    st.session_state.last_input = None
    st.session_state.last_image_name = None
    st.session_state.result_language = None
    st.session_state.retry_requested = False


def _request_retry() -> None:
    """Ask the next rerun to repeat the last analysis."""
    st.session_state.retry_requested = True


def _set_sample(text: str) -> None:
    """Fill the text box with a sample message."""
    st.session_state.message_input = text


def _valid_image(uploaded: Any, language: str) -> bool:
    """Validate the uploaded screenshot and show a friendly error if needed."""
    if uploaded is None:
        return False
    name = str(getattr(uploaded, "name", "screenshot.png"))
    extension = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if extension not in ALLOWED_IMAGE_TYPES:
        st.error(i18n.t("upload_bad_type", language))
        return False
    size = int(getattr(uploaded, "size", 0) or 0)
    if size > MAX_IMAGE_BYTES:
        st.error(i18n.t("upload_too_large", language))
        return False
    return True


def _payload_for_analysis(text: str, uploaded: Any) -> tuple[str | bytes | None, str | None]:
    """Choose the text message or the image bytes to analyse."""
    if text.strip():
        return text.strip(), None
    if uploaded is not None:
        return uploaded.getvalue(), str(getattr(uploaded, "name", "screenshot.png"))
    return None, None


def _run_pipeline(
    payload: str | bytes,
    image_name: str | None,
    language: str,
    ui_lang: str,
) -> None:
    """Stream the agents into live cards, then render the verdict."""
    pipeline_placeholder = st.empty()
    verdict_placeholder = st.empty()
    events: list[dict[str, Any]] = []
    result: dict[str, Any] | None = None
    failed = False

    with pipeline_placeholder.container():
        st.markdown(ui.agent_cards(events, ui_lang), unsafe_allow_html=True)

    try:
        for event in adapter.stream_analysis(
            payload,
            language,
            use_stub=bool(st.session_state.get("use_stub", False)),
            image_name=image_name,
            simulate_partial=bool(st.session_state.get("simulate_partial", False)),
        ):
            events.append(event)
            if event.get("stage") == "complete":
                if event.get("status") == "error":
                    failed = True
                if isinstance(event.get("data"), dict):
                    result = event["data"]
            with pipeline_placeholder.container():
                st.markdown(ui.agent_cards(events, ui_lang), unsafe_allow_html=True)
    except Exception:  # noqa: BLE001 - never show a raw traceback
        logger.exception("Unhandled UI pipeline error")
        failed = True

    if result is None:
        failed = True

    st.session_state.events = events
    st.session_state.result = None if failed else result
    st.session_state.error = failed
    if not failed:
        st.session_state.result_language = language

    with verdict_placeholder.container():
        if failed:
            st.markdown(ui.error_panel(ui_lang), unsafe_allow_html=True)
            st.button(
                i18n.t("retry", ui_lang),
                key="retry_error",
                on_click=_request_retry,
                use_container_width=False,
            )
        else:
            st.markdown(ui.verdict_panel(result or {}, ui_lang), unsafe_allow_html=True)


def _render_sidebar(ui_lang: str) -> None:
    """Render static sidebar content and the demo controls."""
    with st.sidebar:
        st.markdown(ui.sidebar_intro(ui_lang), unsafe_allow_html=True)

        st.toggle(
            i18n.t("demo_toggle", ui_lang),
            key="use_stub",
            help=i18n.t("demo_toggle_help", ui_lang),
        )
        if st.session_state.get("use_stub"):
            if st.session_state.get("stub_reason") not in ("no_key", "import", "forced"):
                st.session_state.stub_reason = "forced"
            st.toggle(
                i18n.t("partial_toggle", ui_lang),
                key="simulate_partial",
                help=i18n.t("partial_toggle_help", ui_lang),
            )
            st.markdown(
                ui.demo_badge(ui_lang, str(st.session_state.get("stub_reason", "forced"))),
                unsafe_allow_html=True,
            )
        else:
            st.session_state.stub_reason = "real"

        st.markdown(ui.sidebar_outro(ui_lang), unsafe_allow_html=True)


def _render_input(ui_lang: str) -> tuple[str, Any, str, bool]:
    """Render tabs, samples, language toggle and action buttons."""
    st.markdown(ui.section_head(i18n.t("input_title", ui_lang), i18n.t("input_sub", ui_lang)), unsafe_allow_html=True)

    with st.container(border=True):
        language = st.radio(
            i18n.t("language_label", ui_lang),
            options=["auto", "en", "hi"],
            format_func=lambda value: i18n.t(f"lang_{value}", ui_lang),
            key="lang",
            horizontal=True,
        )

        text_tab, image_tab = st.tabs(
            [i18n.t("tab_text", ui_lang), i18n.t("tab_image", ui_lang)]
        )

        with text_tab:
            text = st.text_area(
                i18n.t("tab_text", ui_lang),
                key="message_input",
                height=168,
                max_chars=5000,
                placeholder=i18n.t("placeholder", ui_lang),
                label_visibility="collapsed",
            )
            st.caption(i18n.t("chars", ui_lang, count=len(text), limit=5000))

            st.markdown(
                f'<div class="ss-side-title" style="margin-top:10px">{ui.esc(i18n.t("try_example", ui_lang))}</div>'
                f'<div class="ss-meta" style="margin-bottom:8px">{ui.esc(i18n.t("samples_hint", ui_lang))}</div>',
                unsafe_allow_html=True,
            )
            sample_rows = samples.load_samples()
            for row_start in range(0, len(sample_rows), 3):
                columns = st.columns(3)
                for offset, sample in enumerate(sample_rows[row_start : row_start + 3]):
                    tag_key = {
                        "scam": "sample_tag_scam",
                        "suspicious": "sample_tag_suspicious",
                        "safe": "sample_tag_safe",
                    }.get(sample["kind"], "sample_tag_suspicious")
                    label = f"{i18n.t(sample['title_key'], ui_lang)} · {i18n.t(tag_key, ui_lang)}"
                    with columns[offset]:
                        st.button(
                            label,
                            key=f"sample_{sample['id']}",
                            on_click=_set_sample,
                            args=(sample["text"],),
                            use_container_width=True,
                        )

        with image_tab:
            st.caption(i18n.t("upload_hint", ui_lang))
            uploaded = st.file_uploader(
                i18n.t("tab_image", ui_lang),
                type=sorted(ALLOWED_IMAGE_TYPES),
                accept_multiple_files=False,
                key=f"screenshot_{st.session_state.get('uploader_nonce', 0)}",
                label_visibility="collapsed",
            )
            valid_image = _valid_image(uploaded, ui_lang)
            if uploaded is not None and valid_image:
                st.image(uploaded, caption=i18n.t("upload_selected", ui_lang), width=320)
                st.caption(f"{uploaded.name} · {uploaded.size / 1024:.0f} KB")
            elif uploaded is None:
                st.caption(i18n.t("copy_note", ui_lang))

        st.markdown("<div style='height:6px'></div>", unsafe_allow_html=True)
        left, right = st.columns([1, 2])
        with left:
            st.button(
                i18n.t("clear", ui_lang),
                key="clear_input",
                on_click=_clear_inputs,
                use_container_width=True,
            )
        with right:
            has_input = bool(text.strip()) or (uploaded is not None and valid_image)
            analyse = st.button(
                i18n.t("analyze", ui_lang),
                key="analyse_button",
                type="primary",
                disabled=not has_input,
                use_container_width=True,
            )

    return text, uploaded, str(language), analyse


def _render_report(result: dict[str, Any], ui_lang: str) -> None:
    """Voice, downloads and reset controls shown after a verdict."""
    advice = result.get("advice") if isinstance(result.get("advice"), dict) else {}
    components.html(ui.voice_component(advice, ui_lang), height=88, scrolling=False)

    first, second = st.columns(2)
    with first:
        st.download_button(
            i18n.t("download_json", ui_lang),
            data=ui.report_json(result),
            file_name="scam-shield-report.json",
            mime="application/json",
            use_container_width=True,
        )
    with second:
        st.download_button(
            i18n.t("download_text", ui_lang),
            data=ui.report_text(result, ui_lang),
            file_name="scam-shield-report.txt",
            mime="text/plain",
            use_container_width=True,
        )

    if st.button(i18n.t("check_another", ui_lang), key="check_another", use_container_width=False):
        _clear_inputs()
        st.rerun()


def main() -> None:
    """Build the page and run one analysis when requested."""
    st.set_page_config(
        page_title="Scam Shield",
        page_icon="🛡️",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    _inject_styles()
    _init_state()

    ui_lang = _ui_language()
    _render_sidebar(ui_lang)

    st.markdown(
        ui.hero(
            ui_lang,
            demo=bool(st.session_state.get("use_stub")),
            demo_reason=str(st.session_state.get("stub_reason", "forced")),
        ),
        unsafe_allow_html=True,
    )

    text, uploaded, language, analyse = _render_input(ui_lang)

    # A retry from the error card repeats the last payload.
    if st.session_state.get("retry_requested") and st.session_state.get("last_input") is not None:
        st.session_state.retry_requested = False
        st.markdown(ui.section_head(i18n.t("pipeline_title", ui_lang), i18n.t("pipeline_sub", ui_lang)), unsafe_allow_html=True)
        _run_pipeline(
            st.session_state.last_input,
            st.session_state.get("last_image_name"),
            str(st.session_state.get("lang", "auto")),
            ui_lang,
        )
        if st.session_state.result:
            _render_report(st.session_state.result, ui_lang)
        st.markdown(ui.footer(ui_lang), unsafe_allow_html=True)
        return

    # If the user changes the advice language after a verdict, re-run once so
    # the advice and the UI labels agree again.
    if (
        not analyse
        and st.session_state.get("result")
        and st.session_state.get("last_input") is not None
        and st.session_state.get("result_language") != language
    ):
        st.markdown(
            ui.section_head(i18n.t("pipeline_title", ui_lang), i18n.t("pipeline_sub", ui_lang)),
            unsafe_allow_html=True,
        )
        _run_pipeline(
            st.session_state.last_input,
            st.session_state.get("last_image_name"),
            language,
            ui_lang,
        )
        if st.session_state.result:
            _render_report(st.session_state.result, ui_lang)
        st.markdown(ui.footer(ui_lang), unsafe_allow_html=True)
        return

    if analyse:
        payload, image_name = _payload_for_analysis(text, uploaded)
        if payload is None:
            st.warning(i18n.t("need_input", ui_lang))
        else:
            st.session_state.last_input = payload
            st.session_state.last_image_name = image_name
            st.session_state.events = []
            st.session_state.result = None
            st.session_state.error = False
            st.markdown(
                ui.section_head(i18n.t("pipeline_title", ui_lang), i18n.t("pipeline_sub", ui_lang)),
                unsafe_allow_html=True,
            )
            _run_pipeline(payload, image_name, language, ui_lang)
            if st.session_state.result:
                _render_report(st.session_state.result, ui_lang)
            st.markdown(ui.footer(ui_lang), unsafe_allow_html=True)
            return

    if st.session_state.get("result"):
        st.markdown(
            ui.section_head(i18n.t("pipeline_title", ui_lang), i18n.t("pipeline_sub", ui_lang)),
            unsafe_allow_html=True,
        )
        st.markdown(
            ui.agent_cards(list(st.session_state.get("events", [])), ui_lang),
            unsafe_allow_html=True,
        )
        st.markdown(
            ui.verdict_panel(st.session_state.result, ui_lang),
            unsafe_allow_html=True,
        )
        _render_report(st.session_state.result, ui_lang)
    elif st.session_state.get("error"):
        st.markdown(ui.error_panel(ui_lang), unsafe_allow_html=True)
        st.button(
            i18n.t("retry", ui_lang),
            key="retry_top",
            on_click=_request_retry,
        )
    else:
        st.markdown(ui.empty_verdict(ui_lang), unsafe_allow_html=True)

    st.markdown(ui.footer(ui_lang), unsafe_allow_html=True)


if __name__ == "__main__":
    main()
