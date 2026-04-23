import asyncio
import logging

from sqlalchemy import and_, select

from src.domain.enums import NotificationStatus
from src.infrastructure.celery.celery_app import celery_app
from src.infrastructure.database.connection import db
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive

logger = logging.getLogger(__name__)

MAX_RETRIES = 3


@celery_app.task(name="src.application.tasks.notification_retry_task.retry_failed_notifications")
def retry_failed_notifications() -> None:
    asyncio.run(_run())


async def _run() -> None:
    async with db.session_factory() as session:
        stmt = select(NotificationModel).where(
            and_(
                NotificationModel.status == NotificationStatus.FAILED,
                NotificationModel.retry_count < MAX_RETRIES,
            )
        )
        notifications = (await session.execute(stmt)).scalars().all()

        for notification in notifications:
            notification.status = NotificationStatus.PENDING
            notification.retry_count += 1
            notification.scheduled_at = utc_now_naive()

        await session.commit()
        logger.info("notification_retry_task: re-queued %d notifications", len(notifications))
