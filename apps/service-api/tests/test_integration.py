import asyncio
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import src.application.tasks.send_email_task as send_email_task
import src.infrastructure.database.connection as _db_module
from src.application.services.rabbitmq_notification_service import (
    CHANNEL_ROUTES,
    RabbitMQNotificationService,
)
from src.application.tasks.deliver_notification_task import deliver_notification
from src.application.tasks.send_email_task import send_email
from src.domain.enums import (
    NotificationChannel,
    NotificationStatus,
    QRAccessType,
    QRStatus,
)
from src.infrastructure.config import settings
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.database.models.qr import QRCodeModel
from src.infrastructure.utils.datetime_utils import utc_now_naive
from src.main import app
from src.presentation.dependencies import get_db

API_KEY = "test-internal-key"


@pytest.fixture
def api_key(monkeypatch) -> str:
    monkeypatch.setattr(settings, "internal_api_key", API_KEY)
    return API_KEY


@pytest.fixture
def client(db: AsyncSession):
    async def _get_db():
        async with _db_module.db.session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


async def _make_qr(db: AsyncSession, user_id: int, status: QRStatus = QRStatus.ACTIVE) -> QRCodeModel:
    now = utc_now_naive()
    qr = QRCodeModel(
        user_id=user_id,
        room_id=1,
        token=f"token-{user_id}-{status.value}-{now.timestamp()}",
        access_type=QRAccessType.BUILDING,
        valid_from=now - timedelta(hours=1),
        valid_to=now + timedelta(hours=2),
        status=status,
    )
    db.add(qr)
    await db.commit()
    await db.refresh(qr)
    return qr


@pytest.mark.asyncio
async def test_user_deleted_without_key_returns_401(client, api_key):
    response = client.post("/api/service/internal/users/1/deleted")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_user_deleted_with_wrong_key_returns_401(client, api_key):
    response = client.post(
        "/api/service/internal/users/1/deleted",
        headers={"X-Api-Key": "wrong-key"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_user_deleted_revokes_active_qr_codes(db: AsyncSession, client, api_key):
    active = await _make_qr(db, user_id=21)
    used = await _make_qr(db, user_id=21, status=QRStatus.USED)
    other_user = await _make_qr(db, user_id=22)

    response = client.post(
        "/api/service/internal/users/21/deleted",
        headers={"X-Api-Key": api_key},
    )

    assert response.status_code == 204

    await db.refresh(active)
    await db.refresh(used)
    await db.refresh(other_user)

    assert active.status == QRStatus.REVOKED
    assert used.status == QRStatus.USED
    assert other_user.status == QRStatus.ACTIVE


@pytest.mark.asyncio
async def test_user_deleted_unknown_user_returns_204(client, api_key):
    response = client.post(
        "/api/service/internal/users/999999/deleted",
        headers={"X-Api-Key": api_key},
    )

    assert response.status_code == 204


def test_channel_routes_cover_every_channel():
    assert set(CHANNEL_ROUTES) == set(NotificationChannel)
    assert CHANNEL_ROUTES[NotificationChannel.APP][1] == "notifications.app"
    assert CHANNEL_ROUTES[NotificationChannel.EMAIL][1] == "notifications.email"
    assert CHANNEL_ROUTES[NotificationChannel.SMS][1] == "notifications.sms"


@pytest.mark.asyncio
async def test_email_notification_goes_to_email_queue(monkeypatch):
    captured: dict = {}

    def fake_apply_async(kwargs=None, queue=None, **_ignored):
        captured["kwargs"] = kwargs
        captured["queue"] = queue

    monkeypatch.setattr(send_email, "apply_async", fake_apply_async)

    await RabbitMQNotificationService().notify(
        user_id=5,
        title="Zamknięte",
        content="Zgłoszenie zamknięte",
        channel=NotificationChannel.EMAIL,
    )

    assert captured["queue"] == "notifications.email"
    assert captured["kwargs"]["user_id"] == 5
    assert captured["kwargs"]["channel"] == NotificationChannel.EMAIL.value


@pytest.mark.asyncio
async def test_app_notification_goes_to_app_queue(monkeypatch):
    captured: dict = {}

    def fake_apply_async(kwargs=None, queue=None, **_ignored):
        captured["queue"] = queue

    monkeypatch.setattr(deliver_notification, "apply_async", fake_apply_async)

    await RabbitMQNotificationService().notify(user_id=5, title="t", content="c")

    assert captured["queue"] == "notifications.app"


class _Boom(Exception):
    pass


def test_send_email_retries_when_lookup_fails(monkeypatch):
    def failing_lookup(user_id: int) -> str:
        raise OSError("core-api unreachable")

    retries: dict = {}

    def fake_retry(countdown=None, exc=None):
        retries["countdown"] = countdown
        retries["exc"] = exc
        raise _Boom()

    monkeypatch.setattr(send_email_task, "fetch_user_email", failing_lookup)
    monkeypatch.setattr(send_email, "retry", fake_retry)

    with pytest.raises(_Boom):
        send_email(user_id=1, title="t", content="c")

    assert retries["countdown"] == 1
    assert isinstance(retries["exc"], OSError)


@pytest.mark.asyncio
async def test_send_email_saves_failed_after_last_retry(db: AsyncSession, monkeypatch):
    from celery.exceptions import MaxRetriesExceededError

    def failing_lookup(user_id: int) -> str:
        raise OSError("core-api unreachable")

    def exhausted_retry(countdown=None, exc=None):
        raise MaxRetriesExceededError()

    monkeypatch.setattr(send_email_task, "fetch_user_email", failing_lookup)
    monkeypatch.setattr(send_email, "retry", exhausted_retry)

    await asyncio.to_thread(send_email, user_id=31, title="t", content="c")

    rows = (
        await db.execute(select(NotificationModel).where(NotificationModel.user_id == 31))
    ).scalars().all()

    assert len(rows) == 1
    assert rows[0].status == NotificationStatus.FAILED
    assert rows[0].channel == NotificationChannel.EMAIL
    assert rows[0].sent_at is None


@pytest.mark.asyncio
async def test_send_email_saves_sent_on_success(db: AsyncSession, monkeypatch):
    sent: dict = {}

    monkeypatch.setattr(send_email_task, "fetch_user_email", lambda user_id: "resident@example.com")
    monkeypatch.setattr(
        send_email_task,
        "send_smtp_message",
        lambda recipient, title, content: sent.update(recipient=recipient, title=title),
    )

    await asyncio.to_thread(send_email, user_id=32, title="Zamknięte", content="c")

    rows = (
        await db.execute(select(NotificationModel).where(NotificationModel.user_id == 32))
    ).scalars().all()

    assert sent["recipient"] == "resident@example.com"
    assert len(rows) == 1
    assert rows[0].status == NotificationStatus.SENT
    assert rows[0].sent_at is not None
