"""
Tests for Celery task logic. We call the async helper functions (_save, _run)
directly so no broker is needed. These helpers use the global `db` instance
from connection.py, which reads DATABASE_URL from the environment — the same
DB the fixtures use, so rows written by tasks are visible in the test session.
"""
from datetime import datetime, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.tasks.deliver_notification_task import _save
from src.application.tasks.payment_deadline_task import _run as payment_run
from src.domain.enums import NotificationChannel, NotificationStatus
from src.infrastructure.database.models.event import EventModel, EventSource, EventType
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive


def _now():
    return utc_now_naive()


# ---------------------------------------------------------------------------
# deliver_notification task
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_deliver_notification_saves_to_db(db: AsyncSession):
    await _save(user_id=1, title="Test", content="Hello", channel="APP")

    result = await db.execute(
        select(NotificationModel).where(NotificationModel.user_id == 1)
    )
    notification = result.scalar_one_or_none()

    assert notification is not None
    assert notification.title == "Test"
    assert notification.status == NotificationStatus.SENT
    assert notification.sent_at is not None
    assert notification.channel == NotificationChannel.APP


# ---------------------------------------------------------------------------
# payment_deadline task
# ---------------------------------------------------------------------------


async def _insert_payment_event(db: AsyncSession, start_at: datetime, user_id: int = 99) -> EventModel:
    event = EventModel(
        user_id=user_id,
        title="Rent payment",
        description=None,
        start_at=start_at,
        end_at=start_at + timedelta(hours=1),
        source=EventSource.ADMIN,
        type=EventType.PAYMENT,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@pytest.mark.asyncio
async def test_payment_deadline_creates_notification(db: AsyncSession):
    target_date = _now() + timedelta(days=7)
    await _insert_payment_event(db, target_date, user_id=99)

    await payment_run()

    result = await db.execute(
        select(NotificationModel).where(NotificationModel.user_id == 99)
    )
    notification = result.scalar_one_or_none()

    assert notification is not None
    assert notification.title == "Напоминание об оплате"
    assert notification.status == NotificationStatus.PENDING


@pytest.mark.asyncio
async def test_payment_deadline_idempotent(db: AsyncSession):
    target_date = _now() + timedelta(days=7)
    await _insert_payment_event(db, target_date, user_id=88)

    await payment_run()
    await payment_run()

    result = await db.execute(
        select(NotificationModel).where(NotificationModel.user_id == 88)
    )
    notifications = result.scalars().all()

    assert len(notifications) == 1


@pytest.mark.asyncio
async def test_payment_deadline_skips_non_payment_events(db: AsyncSession):
    target_date = _now() + timedelta(days=7)
    event = EventModel(
        user_id=77,
        title="Room inspection",
        description=None,
        start_at=target_date,
        end_at=target_date + timedelta(hours=1),
        source=EventSource.ADMIN,
        type=EventType.ROOM_INSPECTION,
    )
    db.add(event)
    await db.commit()

    await payment_run()

    result = await db.execute(
        select(NotificationModel).where(NotificationModel.user_id == 77)
    )
    assert result.scalar_one_or_none() is None
