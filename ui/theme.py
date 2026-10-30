"""Design tokens for the Scam Shield frontend.

The visual language follows the supplied dark "security dashboard" reference:
deep navy surfaces, violet accents, soft rounded cards and a single loud
gradient highlight. Verdict colours are deliberately fixed so the meaning of
green / amber / red never changes between screens.
"""

from __future__ import annotations

from typing import Final

PALETTE: Final[dict[str, str]] = {
    "bg": "#0a0c18",
    "bg_soft": "#0e1120",
    "surface": "#141829",
    "surface_raised": "#1a1f34",
    "surface_hover": "#202640",
    "border": "#272c44",
    "border_strong": "#3a4160",
    "text": "#f6f7ff",
    "text_muted": "#9aa3bd",
    "text_faint": "#6f7893",
    "primary": "#8b5cf6",
    "primary_bright": "#a855f7",
    "pink": "#ec4899",
    "blue": "#3b82f6",
    "cyan": "#22d3ee",
    "green": "#16a34a",
    "amber": "#f59e0b",
    "red": "#dc2626",
    "green_soft": "rgba(22, 163, 74, 0.16)",
    "amber_soft": "rgba(245, 158, 11, 0.16)",
    "red_soft": "rgba(220, 38, 38, 0.16)",
}

RADII: Final[dict[str, str]] = {
    "sm": "10px",
    "md": "14px",
    "lg": "20px",
    "xl": "28px",
    "pill": "999px",
}

SPACING: Final[dict[str, str]] = {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
}

SHADOWS: Final[dict[str, str]] = {
    "card": "0 18px 44px rgba(0, 0, 0, 0.34)",
    "glow": "0 0 0 1px rgba(139, 92, 246, 0.35), 0 18px 48px rgba(88, 28, 135, 0.25)",
}

FONTS: Final[dict[str, str]] = {
    "ui": "'Manrope', 'Noto Sans Devanagari', system-ui, sans-serif",
    "hindi": "'Noto Sans Devanagari', 'Manrope', system-ui, sans-serif",
}

VERDICT_META: Final[dict[str, dict[str, str]]] = {
    "safe": {
        "color": PALETTE["green"],
        "soft": PALETTE["green_soft"],
        "icon": "✓",
        "en": "SAFE",
        "hi": "सुरक्षित",
    },
    "suspicious": {
        "color": PALETTE["amber"],
        "soft": PALETTE["amber_soft"],
        "icon": "!",
        "en": "BE CAREFUL",
        "hi": "सावधान रहें",
    },
    "scam": {
        "color": PALETTE["red"],
        "soft": PALETTE["red_soft"],
        "icon": "✕",
        "en": "SCAM",
        "hi": "धोखाधड़ी",
    },
}


def css_variables() -> str:
    """Return the palette as a ``:root`` CSS variable block.

    ``ui/styles.css`` declares the same variables for the browser; keeping a
    Python copy lets components use the tokens in inline styles.
    """
    variables = "".join(
        f"--ss-{name.replace('_', '-')}: {value};" for name, value in PALETTE.items()
    )
    radii = "".join(f"--ss-radius-{name}: {value};" for name, value in RADII.items())
    spacing = "".join(f"--ss-space-{name}: {value};" for name, value in SPACING.items())
    return f":root{{{variables}{radii}{spacing}}}"


def verdict_meta(verdict: str) -> dict[str, str]:
    """Return display metadata for a verdict, defaulting to suspicious."""
    return VERDICT_META.get(str(verdict).lower(), VERDICT_META["suspicious"])
