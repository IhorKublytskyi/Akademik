import logging

from src.application.ports.notification_port import NotificationPort
from src.application.tasks.deliver_notification_task import deliver_notification
from src.application.tasks.send_email_task import send_email
from src.domain.enums import NotificationChannel

logger = logging.getLogger("integration")

CHANNEL_ROUTES: dict[NotificationChannel, tuple[str, str]] = {
    NotificationChannel.APP: (
        "src.application.tasks.deliver_notification_task.deliver_notification",
        "notifications.app",
    ),
    NotificationChannel.EMAIL: (
        "src.application.tasks.send_email_task.send_email",
        "notifications.email",
    ),
    NotificationChannel.SMS: (
        "src.application.tasks.deliver_notification_task.deliver_notification",
        "notifications.sms",
    ),
}

_TASKS = {
    "src.application.tasks.deliver_notification_task.deliver_notification": deliver_notification,
    "src.application.tasks.send_email_task.send_email": send_email,
}


class RabbitMQNotificationService(NotificationPort):
    async def notify(
        self,
        user_id: int,
        title: str,
        content: str,
        channel: NotificationChannel = NotificationChannel.APP,
    ) -> None:
        task_name, queue = CHANNEL_ROUTES[channel]
        logger.info(
            "notify: routing channel=%s to queue=%s task=%s", channel.value, queue, task_name
        )
        _TASKS[task_name].apply_async(
            kwargs={
                "user_id": user_id,
                "title": title,
                "content": content,
                "channel": channel.value,
            },
            queue=queue,
        )
