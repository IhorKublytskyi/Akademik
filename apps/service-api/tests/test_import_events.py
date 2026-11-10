from pathlib import Path

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from scripts.import_events import import_events
from src.domain.enums import EventSource, EventType
from src.infrastructure.database.models.event import EventModel

SAMPLE_CSV = Path(__file__).resolve().parents[1] / "scripts" / "sample_events.csv"


@pytest.mark.asyncio
async def test_import_sample_events(db: AsyncSession):
    imported, failed = await import_events(str(SAMPLE_CSV))

    rows = (await db.execute(select(EventModel))).scalars().all()

    assert failed == 0
    assert imported == len(rows) == 5
    assert all(row.source == EventSource.ADMIN for row in rows)
    assert {row.type for row in rows} == {
        EventType.ROOM_INSPECTION,
        EventType.PAYMENT,
        EventType.OTHER,
    }


@pytest.mark.asyncio
async def test_import_skips_invalid_rows(db: AsyncSession, tmp_path: Path):
    csv_file = tmp_path / "events.csv"
    csv_file.write_text(
        "user_id,title,description,start_at,end_at,type\n"
        "1,Good,ok,2026-12-01T09:00:00,2026-12-01T10:00:00,PAYMENT\n"
        "nope,Bad id,ok,2026-12-01T09:00:00,2026-12-01T10:00:00,PAYMENT\n"
        "2,Bad type,ok,2026-12-01T09:00:00,2026-12-01T10:00:00,NOT_A_TYPE\n",
        encoding="utf-8",
    )

    imported, failed = await import_events(str(csv_file))

    rows = (await db.execute(select(EventModel))).scalars().all()

    assert imported == 1
    assert failed == 2
    assert [row.title for row in rows] == ["Good"]
