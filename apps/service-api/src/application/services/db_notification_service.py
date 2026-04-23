from sqlalchemy.ext.asyncio import AsyncSession

from src.application.ports.notification_port import NotificationPort
from src.domain.enums import NotificationChannel, NotificationStatus
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive


class DbNotificationService(NotificationPort):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def notify(
        self,
        user_id: int,
        title: str,
        content: str,
        channel: NotificationChannel = NotificationChannel.APP,
    ) -> None:
        notification = NotificationModel(
            user_id=user_id,
            channel=channel,
            title=title,
            content=content,
            status=NotificationStatus.PENDING,
            scheduled_at=utc_now_naive(),
        )
        self._db.add(notification)
        await self._db.flush()
