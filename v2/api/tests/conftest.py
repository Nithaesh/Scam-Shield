"""Test fixtures and mock environment for Scam Shield v2 backend tests."""

from __future__ import annotations

import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Ensure tests run in deterministic offline mode by default
os.environ["USE_STUB_UI"] = "1"
os.environ["COMMUNITY_ENABLED"] = "true"
os.environ["COMMUNITY_ESCALATION"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from v2.api.main import app
from v2.api.db.session import Base, engine, init_db
from v2.api.db.models import EntityReportModel


@pytest.fixture(autouse=True)
def setup_test_database():
    """Create in-memory SQLite schema before each test."""
    init_db()
    yield
    # Clean table data
    Base.metadata.drop_all(bind=engine)
    init_db()


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)
