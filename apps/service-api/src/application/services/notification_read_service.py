from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.models.notification import NotificationModel

_ADMIN_ROLES = {"Admin", "ADMIN"}


async def get_notifications(
    db: AsyncSession,
    user_id: int,
    role: str,
) -> list[NotificationModel]:
    stmt = select(NotificationModel)

    if role not in _ADMIN_ROLES:
        stmt = stmt.where(NotificationModel.user_id == user_id)

    stmt = stmt.order_by(NotificationModel.scheduled_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())
