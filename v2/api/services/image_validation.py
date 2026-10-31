"""Image input validation, MIME verification, dimensions check, and EXIF stripping."""

from __future__ import annotations

import base64
import io
from PIL import Image

ALLOWED_FORMATS = {"PNG", "JPEG", "WEBP"}
ALLOWED_MIMES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
MAX_DIMENSION = 4000


def validate_and_sanitize_image(
    image_base64: str,
    image_mime: str | None = None,
    max_mb: int = 5,
) -> tuple[bytes, str]:
    """Validate, sanitize, and strip EXIF metadata from uploaded screenshot.

    Returns:
        tuple[bytes, str]: (sanitized_image_bytes, canonical_mime_type)

    Raises:
        ValueError: If image is malformed, too large, bad format, or excessive dimensions.
    """
    if not image_base64 or not image_base64.strip():
        raise ValueError("Image data is empty.")

    # Clean potential data URI header (e.g. data:image/png;base64,...)
    clean_b64 = image_base64.strip()
    if "," in clean_b64 and clean_b64.startswith("data:"):
        header, clean_b64 = clean_b64.split(",", 1)
        if not image_mime and ";" in header:
            image_mime = header.split(";")[0].replace("data:", "").strip().lower()

    # Base64 decode
    try:
        raw_bytes = base64.b64decode(clean_b64, validate=True)
    except Exception as exc:
        raise ValueError("Invalid Base64 encoding in image payload.") from exc

    # File size limit check
    size_mb = len(raw_bytes) / (1024 * 1024)
    if size_mb > max_mb:
        raise ValueError(f"Image file size ({size_mb:.1f} MB) exceeds maximum allowed limit ({max_mb} MB).")

    # Pillow inspection of magic bytes & integrity
    try:
        with Image.open(io.BytesIO(raw_bytes)) as img:
            fmt = (img.format or "").upper()
            if fmt == "JPG":
                fmt = "JPEG"

            if fmt not in ALLOWED_FORMATS:
                raise ValueError(
                    f"Unsupported image format '{fmt}'. Allowed formats are PNG, JPEG, and WebP."
                )

            width, height = img.size
            if width > MAX_DIMENSION or height > MAX_DIMENSION:
                raise ValueError(
                    f"Image dimensions ({width}x{height}) exceed maximum allowed limit of {MAX_DIMENSION}px."
                )

            # Re-encode to clean in-memory buffer without EXIF metadata
            output_buffer = io.BytesIO()
            save_format = "PNG" if fmt == "PNG" else ("WEBP" if fmt == "WEBP" else "JPEG")
            
            # If RGBA converted to JPEG, convert to RGB first
            if save_format == "JPEG" and img.mode in ("RGBA", "P"):
                rgb_img = img.convert("RGB")
                rgb_img.save(output_buffer, format=save_format, quality=90)
            else:
                img.save(output_buffer, format=save_format)

            sanitized_bytes = output_buffer.getvalue()
            canonical_mime = f"image/{save_format.lower()}"

            return sanitized_bytes, canonical_mime

    except (ValueError, Exception) as exc:
        if isinstance(exc, ValueError):
            raise
        raise ValueError(f"Corrupt or unreadable image: {exc}") from exc
