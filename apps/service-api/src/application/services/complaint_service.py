from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import ComplaintAlreadyClosed, ComplaintNotFound
from src.application.services.notification_service import create_notification
from src.domain.entities.complaint import ComplaintCreate, ComplaintStatusUpdate
from src.domain.enums import ComplaintStatus
from src.infrastructure.database.models.complaint import ComplaintModel
from src.infrastructure.utils.datetime_utils import utc_now_naive

_ADMIN_ROLES = {"Admin", "ADMIN"}


async def create_complaint(
    db: AsyncSession,
    user_id: int,
    data: ComplaintCreate,
) -> ComplaintModel:
    complaint = ComplaintModel(
        user_id=None if data.is_anonymous else user_id,
        room_id=data.room_id,
        content=data.content,
        is_anonymous=data.is_anonymous,
        status=ComplaintStatus.NEW,
    )
    db.add(complaint)
    await db.flush()

    if not data.is_anonymous:
        await create_notification(
            db,
            user_id=user_id,
            title="Жалоба зарегистрирована",
            content="Ваша жалоба принята и будет рассмотрена.",
        )

    await db.commit()
    await db.refresh(complaint)
    return complaint


async def get_complaints(
    db: AsyncSession,
    user_id: int,
    role: str,
    status_filter: Optional[ComplaintStatus] = None,
) -> list[ComplaintModel]:
    stmt = select(ComplaintModel)

    if role not in _ADMIN_ROLES:
        stmt = stmt.where(ComplaintModel.user_id == user_id)

    if status_filter is not None:
        stmt = stmt.where(ComplaintModel.status == status_filter)

    stmt = stmt.order_by(ComplaintModel.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_complaint_status(
    db: AsyncSession,
    complaint_id: int,
    data: ComplaintStatusUpdate,
) -> ComplaintModel:
    complaint = await db.get(ComplaintModel, complaint_id)
    if complaint is None:
        raise ComplaintNotFound(f"Complaint {complaint_id} not found")

    if complaint.status == ComplaintStatus.CLOSED:
        raise ComplaintAlreadyClosed(f"Complaint {complaint_id} is already closed")

    old_status = complaint.status
    complaint.status = data.status

    if data.status == ComplaintStatus.CLOSED:
        complaint.closed_at = utc_now_naive()

    await db.flush()

    if complaint.user_id is not None:
        await create_notification(
            db,
            user_id=complaint.user_id,
            title="Статус жалобы изменён",
            content=f"Статус вашей жалобы изменён: {old_status} → {data.status}.",
        )

    await db.commit()
    await db.refresh(complaint)
    return complaint
