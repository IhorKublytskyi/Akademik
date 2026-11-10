from celery import Celery
from celery.schedules import crontab
from kombu import Queue

from src.infrastructure.config import settings

celery_app = Celery(
    "service_api",
    broker=settings.rabbitmq_url,
    include=[
        "src.application.tasks.payment_deadline_task",
        "src.application.tasks.notification_retry_task",
        "src.application.tasks.deliver_notification_task",
        "src.application.tasks.send_email_task",
    ],
)

celery_app.conf.timezone = "UTC"
celery_app.conf.task_default_queue = "celery"
celery_app.conf.task_queues = (
    Queue("celery"),
    Queue("notifications.app"),
    Queue("notifications.email"),
    Queue("notifications.sms"),
)
celery_app.conf.beat_schedule = {
    "payment-deadline-check": {
        "task": "src.application.tasks.payment_deadline_task.check_payment_deadlines",
        "schedule": crontab(hour=8, minute=0),
    },
    "notification-retry": {
        "task": "src.application.tasks.notification_retry_task.retry_failed_notifications",
        "schedule": 1800.0,
    },
}
