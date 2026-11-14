import asyncio

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.services.notification_read_service import get_notifications
from src.application.tasks.deliver_notification_task import _save
from src.infrastructure.database.connection import Database
from tests.conftest import TEST_DB_URL


def test_database_survives_consecutive_event_loops():
    database = Database(TEST_DB_URL)

    async def query() -> int:
        async with database.session_factory() as session:
            return (await session.execute(text("SELECT 1"))).scalar_one()

    results = [asyncio.run(query()) for _ in range(3)]

    assert results == [1, 1, 1]


@pytest.mark.asyncio
async def test_resident_sees_own_notifications_and_admin_sees_all(db: AsyncSession):
    await _save(user_id=1, title="For one", content="c", channel="APP")
    await _save(user_id=2, title="For two", content="c", channel="APP")

    resident = await get_notifications(db, user_id=1, role="Resident")
    admin = await get_notifications(db, user_id=99, role="Admin")

    assert [n.title for n in resident] == ["For one"]
    assert {n.title for n in admin} == {"For one", "For two"}
