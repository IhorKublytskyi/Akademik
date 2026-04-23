from src.application.ports.notification_port import NotificationPort
from src.application.tasks.deliver_notification_task import deliver_notification
from src.domain.enums import NotificationChannel


class RabbitMQNotificationService(NotificationPort):
    async def notify(
        self,
        user_id: int,
        title: str,
        content: str,
        channel: NotificationChannel = NotificationChannel.APP,
    ) -> None:
        deliver_notification.delay(
            user_id=user_id,
            title=title,
            content=content,
            channel=channel.value,
        )
