"""Compatibility shim for ``tools_interface``.

``tools_interface.py`` imports ``real_check_entities`` from a top-level
``tools_real`` module. The implementation lives in :mod:`tools.real`; this file
keeps the teammate-owned interface working without modifying it.
"""

from __future__ import annotations

from tools.real import real_check_entities

__all__ = ["real_check_entities"]
