"""SQLAlchemy ORM models for community fraud intelligence."""

from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from v2.api.db.session import Base


class EntityReportModel(Base):
    """Stores purely hashed fraud indicators (zero raw PII or text)."""

    __tablename__ = "entity_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entity_type = Column(String(32), nullable=False, index=True)  # phone, upi, domain
    entity_hash = Column(String(64), nullable=False, index=True)  # sha256(salt + type:val)
    scam_type = Column(String(64), nullable=True)  # bank_kyc, electricity_bill, etc.
    report_count = Column(Integer, default=1, nullable=False)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("entity_type", "entity_hash", name="uq_entity_type_hash"),
    )
