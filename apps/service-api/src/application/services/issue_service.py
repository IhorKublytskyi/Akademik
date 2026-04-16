from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import AccessDenied, IssueAlreadyClosed, IssueNotFound
from src.application.services.notification_service import create_notification
from src.domain.entities.issue import IssueCreate, IssueStatusUpdate
from src.domain.enums import IssueStatus
from src.infrastructure.database.models.issue import IssueModel
from src.infrastructure.utils.datetime_utils import utc_now_naive

_ADMIN_ROLES = {"Admin", "ADMIN"}


async def create_issue(
    db: AsyncSession,
    user_id: int,
    data: IssueCreate,
) -> IssueModel:
    issue = IssueModel(
        user_id=user_id,
        room_id=data.room_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        status=IssueStatus.NEW,
    )
    db.add(issue)
    await db.flush()

    await create_notification(
        db,
        user_id=user_id,
        title="Заявка создана",
        content=f'Ваша заявка "{data.title}" успешно зарегистрирована.',
    )

    await db.commit()
    await db.refresh(issue)
    return issue


async def get_issues(
    db: AsyncSession,
    user_id: int,
    role: str,
    status_filter: Optional[IssueStatus] = None,
) -> list[IssueModel]:
    stmt = select(IssueModel)

    if role not in _ADMIN_ROLES:
        stmt = stmt.where(IssueModel.user_id == user_id)

    if status_filter is not None:
        stmt = stmt.where(IssueModel.status == status_filter)

    stmt = stmt.order_by(IssueModel.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_issue_status(
    db: AsyncSession,
    issue_id: int,
    data: IssueStatusUpdate,
) -> IssueModel:
    issue = await db.get(IssueModel, issue_id)
    if issue is None:
        raise IssueNotFound(f"Issue {issue_id} not found")

    if issue.status == IssueStatus.CLOSED:
        raise IssueAlreadyClosed(f"Issue {issue_id} is already closed")

    old_status = issue.status
    issue.status = data.status

    if data.status == IssueStatus.CLOSED:
        issue.closed_at = utc_now_naive()

    await db.flush()

    await create_notification(
        db,
        user_id=issue.user_id,
        title="Статус заявки изменён",
        content=f'Статус вашей заявки "{issue.title}" изменён: {old_status} → {data.status}.',
    )

    await db.commit()
    await db.refresh(issue)
    return issue
