import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import IssueAlreadyClosed, IssueNotFound
from src.application.services.issue_service import create_issue, update_issue_status
from src.domain.entities.issue import IssueCreate, IssueStatusUpdate
from src.domain.enums import IssuePriority, IssueStatus
from src.infrastructure.database.models.issue import IssueModel
from tests.conftest import StubNotifier


async def _make_issue(db: AsyncSession, notifier: StubNotifier, **kwargs) -> IssueModel:
    data = IssueCreate(
        room_id=kwargs.get("room_id", 1),
        title=kwargs.get("title", "Broken window"),
        description=kwargs.get("description", None),
        priority=kwargs.get("priority", IssuePriority.NORMAL),
    )
    return await create_issue(db, user_id=kwargs.get("user_id", 42), data=data, notifier=notifier)


@pytest.mark.asyncio
async def test_create_issue_persisted(db: AsyncSession, notifier: StubNotifier):
    issue = await _make_issue(db, notifier)

    result = await db.execute(select(IssueModel).where(IssueModel.id == issue.id))
    row = result.scalar_one_or_none()

    assert row is not None
    assert row.title == "Broken window"
    assert row.status == IssueStatus.NEW
    assert row.user_id == 42


@pytest.mark.asyncio
async def test_create_issue_notifies_user(db: AsyncSession, notifier: StubNotifier):
    await _make_issue(db, notifier, user_id=7)

    assert len(notifier.calls) == 1
    assert notifier.calls[0]["user_id"] == 7


@pytest.mark.asyncio
async def test_update_issue_status_changes_db(db: AsyncSession, notifier: StubNotifier):
    issue = await _make_issue(db, notifier)
    updated = await update_issue_status(
        db, issue.id, IssueStatusUpdate(status=IssueStatus.IN_PROGRESS), notifier
    )

    assert updated.status == IssueStatus.IN_PROGRESS
    assert updated.closed_at is None


@pytest.mark.asyncio
async def test_close_issue_sets_closed_at(db: AsyncSession, notifier: StubNotifier):
    issue = await _make_issue(db, notifier)
    updated = await update_issue_status(
        db, issue.id, IssueStatusUpdate(status=IssueStatus.CLOSED), notifier
    )

    assert updated.status == IssueStatus.CLOSED
    assert updated.closed_at is not None


@pytest.mark.asyncio
async def test_update_closed_issue_raises(db: AsyncSession, notifier: StubNotifier):
    issue = await _make_issue(db, notifier)
    await update_issue_status(db, issue.id, IssueStatusUpdate(status=IssueStatus.CLOSED), notifier)

    with pytest.raises(IssueAlreadyClosed):
        await update_issue_status(
            db, issue.id, IssueStatusUpdate(status=IssueStatus.IN_PROGRESS), notifier
        )


@pytest.mark.asyncio
async def test_update_missing_issue_raises(db: AsyncSession, notifier: StubNotifier):
    with pytest.raises(IssueNotFound):
        await update_issue_status(
            db, 99999, IssueStatusUpdate(status=IssueStatus.CLOSED), notifier
        )


@pytest.mark.asyncio
async def test_update_issue_notifies_owner(db: AsyncSession, notifier: StubNotifier):
    issue = await _make_issue(db, notifier, user_id=15)
    notifier.calls.clear()

    await update_issue_status(db, issue.id, IssueStatusUpdate(status=IssueStatus.IN_PROGRESS), notifier)

    assert len(notifier.calls) == 1
    assert notifier.calls[0]["user_id"] == 15
