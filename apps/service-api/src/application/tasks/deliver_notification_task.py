import asyncio

from src.domain.enums import NotificationChannel, NotificationStatus
from src.infrastructure.celery.celery_app import celery_app
from src.infrastructure.database.connection import db
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive


@celery_app.task(name="src.application.tasks.deliver_notification_task.deliver_notification")
def deliver_notification(user_id: int, title: str, content: str, channel: str) -> None:
    asyncio.run(_save(user_id, title, content, channel))


async def _save(user_id: int, title: str, content: str, channel: str) -> None:
    async with db.session_factory() as session:
        notification = NotificationModel(
            user_id=user_id,
            channel=NotificationChannel(channel),
            title=title,
            content=content,
            status=NotificationStatus.PENDING,
            scheduled_at=utc_now_naive(),
        )
        session.add(notification)
        await session.commit()
