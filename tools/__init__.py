"""Real entity-intelligence tools used by the Entity Checker agent.

The package is imported lazily by ``tools_interface`` only when
``USE_MOCK_TOOLS=0``. The public contract lives in :mod:`tools.real`.
"""

from __future__ import annotations

__all__ = ["real"]
