"""Repository layer for community threat reports."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from sqlalchemy import func
from sqlalchemy.orm import Session
from v2.api.db.models import EntityReportModel
from v2.api.services.community import (
    compute_entity_hash,
    mask_entity_for_display,
    normalize_entity_value,
)
from v2.api.models.schemas import CommunityLookupMatch


class CommunityRepository:
    """Manages secure hashed entity lookup and report updates."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def report_entity(self, entity_type: str, raw_value: str, scam_type: str | None = None) -> EntityReportModel:
        """Record or increment a community scam report for an entity."""
        normalized = normalize_entity_value(entity_type, raw_value)
        e_hash = compute_entity_hash(entity_type, normalized)

        existing = (
            self.db.query(EntityReportModel)
            .filter_by(entity_type=entity_type, entity_hash=e_hash)
            .first()
        )

        now = datetime.now(timezone.utc)
        if existing:
            existing.report_count += 1
            existing.last_seen = now
            if scam_type and not existing.scam_type:
                existing.scam_type = scam_type
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            record = EntityReportModel(
                entity_type=entity_type,
                entity_hash=e_hash,
                scam_type=scam_type,
                report_count=1,
                first_seen=now,
                last_seen=now,
            )
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)
            return record

    def lookup_entities(self, items: list[dict[str, str]]) -> list[CommunityLookupMatch]:
        """Check a list of entities against the community database."""
        matches: list[CommunityLookupMatch] = []
        if not items:
            return matches

        for item in items:
            e_type = item.get("type", "").strip().lower()
            val = item.get("value", "").strip()
            if not e_type or not val:
                continue

            normalized = normalize_entity_value(e_type, val)
            e_hash = compute_entity_hash(e_type, normalized)

            record = (
                self.db.query(EntityReportModel)
                .filter_by(entity_type=e_type, entity_hash=e_hash)
                .first()
            )

            if record:
                matches.append(
                    CommunityLookupMatch(
                        entity_type=e_type,
                        entity_masked=mask_entity_for_display(e_type, normalized),
                        report_count=record.report_count,
                        scam_type=record.scam_type,
                        first_seen=record.first_seen.isoformat() if record.first_seen else None,
                        last_seen=record.last_seen.isoformat() if record.last_seen else None,
                    )
                )

        return matches

    def get_stats(self) -> dict[str, Any]:
        """Aggregate statistical summary (zero raw values)."""
        total_reports = self.db.query(func.sum(EntityReportModel.report_count)).scalar() or 0
        unique_entities = self.db.query(func.count(EntityReportModel.id)).scalar() or 0

        # Top scam types
        type_rows = (
            self.db.query(EntityReportModel.scam_type, func.count(EntityReportModel.id))
            .filter(EntityReportModel.scam_type.isnot(None))
            .group_by(EntityReportModel.scam_type)
            .order_by(func.count(EntityReportModel.id).desc())
            .limit(10)
            .all()
        )
        top_types = {str(r[0]): int(r[1]) for r in type_rows}

        return {
            "total_reports": int(total_reports),
            "unique_entities": int(unique_entities),
            "top_scam_types": top_types,
        }
