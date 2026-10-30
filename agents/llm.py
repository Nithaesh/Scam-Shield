"""LLM interaction layer with Gemini Flash primary, Groq fallback, retries, and JSON repair."""

from __future__ import annotations

import json
import logging
import os
import re
import time
from typing import Any, Callable, Type, TypeVar
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError

load_dotenv()

logger = logging.getLogger("scam_shield.llm")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

T = TypeVar("T", bound=BaseModel)

TIMEOUT_SECONDS = 30.0
MAX_RETRIES = 2
BACKOFF_FACTOR = 1.5


def _clean_json_markdown(text: str) -> str:
    """Strip markdown code fence blocks from an LLM response string."""
    cleaned = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        return match.group(1).strip()
    if cleaned.startswith("`") and cleaned.endswith("`"):
        return cleaned.strip("`").strip()
    return cleaned


def _call_gemini(
    system: str,
    user: str,
    image: bytes | None = None,
    image_mime_type: str = "image/png",
    json_mode: bool = False,
) -> str:
    """Execute API call against Google Gemini."""
    from google import genai
    from google.genai import types

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in environment.")

    model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=TIMEOUT_SECONDS))

    contents: list[Any] = []
    if image is not None:
        contents.append(types.Part.from_bytes(data=image, mime_type=image_mime_type))
    contents.append(user)

    config = types.GenerateContentConfig(
        system_instruction=system,
        response_mime_type="application/json" if json_mode else None,
        temperature=0.1,
    )

    response = client.models.generate_content(
        model=model_name,
        contents=contents,
        config=config,
    )

    if not response.text:
        raise RuntimeError("Empty response received from Gemini.")
    return response.text


def _call_groq(
    system: str,
    user: str,
    image: bytes | None = None,
    json_mode: bool = False,
) -> str:
    """Execute API call against Groq Llama fallback (text only)."""
    if image is not None:
        raise ValueError("Groq fallback does not support image analysis; Gemini vision is required.")

    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in environment.")

    model_name = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    client = Groq(api_key=api_key, timeout=TIMEOUT_SECONDS)

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

    response_format = {"type": "json_object"} if json_mode else None

    completion = client.chat.completions.create(
        model=model_name,
        messages=messages,
        response_format=response_format,
        temperature=0.1,
    )

    content = completion.choices[0].message.content
    if not content:
        raise RuntimeError("Empty response received from Groq.")
    return content


def call_llm(
    system: str,
    user: str,
    image: bytes | None = None,
    image_mime_type: str = "image/png",
    json_mode: bool = False,
) -> str:
    """Call the primary LLM (Gemini) with automatic fallback to Groq and retry logic."""
    force_fallback = os.getenv("FORCE_FALLBACK", "0").lower() in ("1", "true", "yes")

    if not force_fallback:
        # Try Gemini with retries
        for attempt in range(MAX_RETRIES + 1):
            try:
                logger.debug("Attempting Gemini call (attempt %d/%d)", attempt + 1, MAX_RETRIES + 1)
                return _call_gemini(
                    system=system,
                    user=user,
                    image=image,
                    image_mime_type=image_mime_type,
                    json_mode=json_mode,
                )
            except ValueError as ve:
                # Configuration error (missing key, invalid parameter) - do not retry
                logger.warning("Gemini configuration error: %s. Switching to fallback.", str(ve))
                break
            except Exception as e:
                logger.warning("Gemini attempt %d failed: %s", attempt + 1, str(e))
                if attempt < MAX_RETRIES:
                    time.sleep(BACKOFF_FACTOR ** (attempt + 1))
                else:
                    logger.warning("Gemini retries exhausted; switching to Groq fallback.")

    # Fallback to Groq
    if image is not None:
        raise ValueError("Groq fallback does not support image inputs; Gemini is unavailable.")

    for attempt in range(MAX_RETRIES + 1):
        try:
            logger.info("Attempting Groq fallback call (attempt %d/%d)", attempt + 1, MAX_RETRIES + 1)
            return _call_groq(
                system=system,
                user=user,
                image=image,
                json_mode=json_mode,
            )
        except ValueError as ve:
            # Configuration error - do not retry
            logger.error("Groq configuration error: %s", str(ve))
            raise RuntimeError(f"LLM configuration error: {ve}") from ve
        except Exception as e:
            logger.error("Groq attempt %d failed: %s", attempt + 1, str(e))
            if attempt < MAX_RETRIES:
                time.sleep(BACKOFF_FACTOR ** (attempt + 1))
            else:
                raise RuntimeError(f"All LLM providers (Gemini and Groq) failed: {e}") from e

    raise RuntimeError("Unreachable LLM execution state.")


def call_llm_json(
    schema: Type[T],
    system: str,
    user: str,
    image: bytes | None = None,
    image_mime_type: str = "image/png",
    default_factory: Callable[[], T] | None = None,
) -> T:
    """Call LLM expecting JSON output validated against Pydantic schema with repair retry."""
    raw_response: str | None = None
    try:
        raw_response = call_llm(
            system=system,
            user=user,
            image=image,
            image_mime_type=image_mime_type,
            json_mode=True,
        )
        cleaned = _clean_json_markdown(raw_response)
        return schema.model_validate_json(cleaned)
    except (ValidationError, json.JSONDecodeError, ValueError) as err:
        logger.warning("JSON schema validation failed: %s. Initiating repair retry.", str(err))

        # One retry with explicit error notice
        repair_user = (
            f"{user}\n\n"
            f"[SYSTEM CORRECTION]\n"
            f"Your previous response was invalid JSON or did not conform to the required schema:\n"
            f"Validation Error: {err}\n"
            f"Previous output snippet: {raw_response[:300] if raw_response else 'None'}\n"
            f"Return ONLY the corrected, valid JSON object matching the requested schema with no extra text or markdown formatting."
        )

        try:
            retry_raw = call_llm(
                system=system,
                user=repair_user,
                image=image,
                image_mime_type=image_mime_type,
                json_mode=True,
            )
            cleaned_retry = _clean_json_markdown(retry_raw)
            return schema.model_validate_json(cleaned_retry)
        except Exception as retry_err:
            logger.error("JSON repair retry failed: %s. Generating safe fallback.", str(retry_err))

    except Exception as general_err:
        logger.error("Fatal LLM call failure: %s. Generating safe fallback.", str(general_err))

    # Safe fallback handling
    if default_factory is not None:
        return default_factory()

    if hasattr(schema, "fallback") and callable(getattr(schema, "fallback")):
        return schema.fallback()  # type: ignore[no-any-return]

    # Minimal fallback instance
    try:
        return schema.model_validate({"status": "could_not_check"})
    except Exception:
        raise RuntimeError(f"Could not construct fallback for schema {schema.__name__}")
