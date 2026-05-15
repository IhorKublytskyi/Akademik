import os

import pytest
import pytest_asyncio
import src.infrastructure.database.connection as _db_module
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from src.application.ports.notification_port import NotificationPort
from src.domain.enums import NotificationChannel
from src.infrastructure.database.connection import Base
from src.infrastructure.database.models import complaint, event, issue, notification, qr  # noqa: F401

TEST_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://akademik:secret@localhost:5432/akademik_test",
)

_TABLE_NAMES = ["notifications", "issues", "complaints", "events", "qr_codes"]

# Patch the global `db` used by Celery task helpers (_save, _run) to use
# NullPool so asyncpg connections are not cached across event loops.
_test_engine = create_async_engine(TEST_DB_URL, echo=False, poolclass=NullPool)
_db_module.db.engine = _test_engine
_db_module.db.session_factory = async_sessionmaker(
    _test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture
async def db():
    engine = create_async_engine(TEST_DB_URL, echo=False, poolclass=NullPool)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for name in _TABLE_NAMES:
            await conn.execute(text(f"TRUNCATE TABLE {name} RESTART IDENTITY CASCADE"))

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


class StubNotifier(NotificationPort):
    def __init__(self):
        self.calls: list[dict] = []

    async def notify(
        self,
        user_id: int,
        title: str,
        content: str,
        channel: NotificationChannel = NotificationChannel.APP,
    ) -> None:
        self.calls.append({"user_id": user_id, "title": title, "content": content})


@pytest.fixture
def notifier() -> StubNotifier:
    return StubNotifier()
