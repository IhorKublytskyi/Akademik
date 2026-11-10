import asyncio
import csv
import sys
from datetime import datetime

from src.domain.enums import EventSource, EventType
from src.infrastructure.database.connection import db
from src.infrastructure.database.models.event import EventModel

REQUIRED_COLUMNS = ["user_id", "title", "description", "start_at", "end_at", "type"]


def parse_row(row: dict[str, str]) -> EventModel:
    missing = [name for name in REQUIRED_COLUMNS if name not in row]
    if missing:
        raise ValueError(f"missing columns: {', '.join(missing)}")

    description = (row["description"] or "").strip()
    return EventModel(
        user_id=int(row["user_id"]),
        title=row["title"].strip(),
        description=description or None,
        start_at=datetime.fromisoformat(row["start_at"].strip()),
        end_at=datetime.fromisoformat(row["end_at"].strip()),
        source=EventSource.ADMIN,
        type=EventType(row["type"].strip().upper()),
    )


async def import_events(path: str) -> tuple[int, int]:
    imported = 0
    failed = 0

    with open(path, newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    async with db.session_factory() as session:
        for number, row in enumerate(rows, start=2):
            try:
                session.add(parse_row(row))
                imported += 1
            except Exception as exc:
                failed += 1
                print(f"row {number}: {exc}", file=sys.stderr)

        await session.commit()

    return imported, failed


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: python -m scripts.import_events <file.csv>", file=sys.stderr)
        return 1

    imported, failed = asyncio.run(import_events(sys.argv[1]))
    print(f"imported: {imported}")
    print(f"failed: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
