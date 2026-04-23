import asyncio
import logging
from datetime import timedelta

from sqlalchemy import and_, select

from src.domain.enums import EventType, NotificationChannel, NotificationStatus
from src.infrastructure.celery.celery_app import celery_app
from src.infrastructure.database.connection import db
from src.infrastructure.database.models.event import EventModel
from src.infrastructure.database.models.notification import NotificationModel
from src.infrastructure.utils.datetime_utils import utc_now_naive

logger = logging.getLogger(__name__)

_NOTIFICATION_TITLE = "Напоминание об оплате"
_DAYS_AHEAD = 7


@celery_app.task(name="src.application.tasks.payment_deadline_task.check_payment_deadlines")
def check_payment_deadlines() -> None:
    asyncio.run(_run())


async def _run() -> None:
    now = utc_now_naive()
    window_start = now + timedelta(days=_DAYS_AHEAD - 1)
    window_end = now + timedelta(days=_DAYS_AHEAD + 1)

    async with db.session_factory() as session:
        events_stmt = select(EventModel).where(
            and_(
                EventModel.type == EventType.PAYMENT,
                EventModel.start_at >= window_start,
                EventModel.start_at <= window_end,
            )
        )
        events = (await session.execute(events_stmt)).scalars().all()

        created = 0
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        for event in events:
            existing_stmt = select(NotificationModel).where(
                and_(
                    NotificationModel.user_id == event.user_id,
                    NotificationModel.title == _NOTIFICATION_TITLE,
                    NotificationModel.scheduled_at >= today_start,
                )
            )
            if (await session.execute(existing_stmt)).scalar_one_or_none() is not None:
                continue

            session.add(
                NotificationModel(
                    user_id=event.user_id,
                    channel=NotificationChannel.APP,
                    title=_NOTIFICATION_TITLE,
                    content=(
                        f'Срок оплаты "{event.title}" наступает через {_DAYS_AHEAD} дней'
                        f' — {event.start_at.strftime("%d.%m.%Y")}.'
                    ),
                    status=NotificationStatus.PENDING,
                    scheduled_at=now,
                )
            )
            created += 1

        await session.commit()
        logger.info("payment_deadline_task: created %d notifications", created)
