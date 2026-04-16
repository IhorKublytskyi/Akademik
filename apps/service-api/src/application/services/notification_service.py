from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.enums import NotificationChannel, NotificationStatus
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive


async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    content: str,
    channel: NotificationChannel = NotificationChannel.APP,
) -> NotificationModel:
    notification = NotificationModel(
        user_id=user_id,
        channel=channel,
        title=title,
        content=content,
        status=NotificationStatus.PENDING,
        scheduled_at=utc_now_naive(),
    )
    db.add(notification)
    await db.flush()
    return notification
