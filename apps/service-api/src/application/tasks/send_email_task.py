import asyncio
import json
import logging
import smtplib
import urllib.request
from email.message import EmailMessage

from celery.exceptions import MaxRetriesExceededError

from src.domain.enums import NotificationChannel, NotificationStatus
from src.infrastructure.celery.celery_app import celery_app
from src.infrastructure.config import settings
from src.infrastructure.database.connection import db
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive

logger = logging.getLogger("integration")

MAX_RETRIES = 5
LOOKUP_TIMEOUT = 3


def fetch_user_email(user_id: int) -> str:
    request = urllib.request.Request(
        f"{settings.core_api_url}/api/core/internal/users/{user_id}",
        headers={"X-Api-Key": settings.internal_api_key},
    )
    with urllib.request.urlopen(request, timeout=LOOKUP_TIMEOUT) as response:
        payload = json.loads(response.read())

    email = payload.get("email")
    if not email:
        raise ValueError(f"core-api returned no email for user {user_id}")
    return email


def send_smtp_message(recipient: str, title: str, content: str | None) -> None:
    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = recipient
    message["Subject"] = title
    message.set_content(content or "")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
        smtp.send_message(message)


async def _save_notification(
    user_id: int, title: str, content: str, status: NotificationStatus
) -> None:
    now = utc_now_naive()
    async with db.session_factory() as session:
        session.add(
            NotificationModel(
                user_id=user_id,
                channel=NotificationChannel.EMAIL,
                title=title,
                content=content,
                status=status,
                scheduled_at=now,
                sent_at=now if status == NotificationStatus.SENT else None,
            )
        )
        await session.commit()


@celery_app.task(
    bind=True,
    name="src.application.tasks.send_email_task.send_email",
    max_retries=MAX_RETRIES,
    acks_late=True,
)
def send_email(
    self,
    user_id: int,
    title: str,
    content: str,
    channel: str = NotificationChannel.EMAIL.value,
) -> None:
    attempt = self.request.retries
    try:
        recipient = fetch_user_email(user_id)
        send_smtp_message(recipient, title, content)
    except Exception as exc:
        logger.warning(
            "send_email: attempt %d failed for user %s: %s", attempt + 1, user_id, exc
        )
        try:
            raise self.retry(countdown=2**attempt, exc=exc)
        except MaxRetriesExceededError:
            logger.error(
                "send_email: giving up for user %s after %d attempts", user_id, attempt + 1
            )
            asyncio.run(
                _save_notification(user_id, title, content, NotificationStatus.FAILED)
            )
            return

    asyncio.run(_save_notification(user_id, title, content, NotificationStatus.SENT))
    logger.info("send_email: delivered notification for user %s", user_id)
