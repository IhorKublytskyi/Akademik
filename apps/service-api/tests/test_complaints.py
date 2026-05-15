import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import ComplaintAlreadyClosed
from src.application.services.complaint_service import create_complaint, update_complaint_status
from src.domain.entities.complaint import ComplaintCreate, ComplaintStatusUpdate
from src.domain.enums import ComplaintStatus
from src.infrastructure.database.models.complaint import ComplaintModel
from tests.conftest import StubNotifier


async def _make_complaint(
    db: AsyncSession,
    notifier: StubNotifier,
    user_id: int = 42,
    is_anonymous: bool = False,
) -> ComplaintModel:
    data = ComplaintCreate(room_id=1, content="Noisy neighbors", is_anonymous=is_anonymous)
    return await create_complaint(db, user_id=user_id, data=data, notifier=notifier)


@pytest.mark.asyncio
async def test_create_complaint_persisted(db: AsyncSession, notifier: StubNotifier):
    complaint = await _make_complaint(db, notifier)

    assert complaint.id is not None
    assert complaint.status == ComplaintStatus.NEW
    assert complaint.user_id == 42


@pytest.mark.asyncio
async def test_create_complaint_notifies(db: AsyncSession, notifier: StubNotifier):
    await _make_complaint(db, notifier, user_id=10)

    assert len(notifier.calls) == 1
    assert notifier.calls[0]["user_id"] == 10


@pytest.mark.asyncio
async def test_anonymous_complaint_no_notification(db: AsyncSession, notifier: StubNotifier):
    complaint = await _make_complaint(db, notifier, is_anonymous=True)

    assert complaint.user_id is None
    assert len(notifier.calls) == 0


@pytest.mark.asyncio
async def test_update_complaint_status(db: AsyncSession, notifier: StubNotifier):
    complaint = await _make_complaint(db, notifier)
    updated = await update_complaint_status(
        db, complaint.id, ComplaintStatusUpdate(status=ComplaintStatus.REVIEW), notifier
    )

    assert updated.status == ComplaintStatus.REVIEW


@pytest.mark.asyncio
async def test_close_complaint_sets_closed_at(db: AsyncSession, notifier: StubNotifier):
    complaint = await _make_complaint(db, notifier)
    updated = await update_complaint_status(
        db, complaint.id, ComplaintStatusUpdate(status=ComplaintStatus.CLOSED), notifier
    )

    assert updated.closed_at is not None


@pytest.mark.asyncio
async def test_update_closed_complaint_raises(db: AsyncSession, notifier: StubNotifier):
    complaint = await _make_complaint(db, notifier)
    await update_complaint_status(
        db, complaint.id, ComplaintStatusUpdate(status=ComplaintStatus.CLOSED), notifier
    )

    with pytest.raises(ComplaintAlreadyClosed):
        await update_complaint_status(
            db, complaint.id, ComplaintStatusUpdate(status=ComplaintStatus.REVIEW), notifier
        )


@pytest.mark.asyncio
async def test_anonymous_complaint_status_update_no_notification(
    db: AsyncSession, notifier: StubNotifier
):
    complaint = await _make_complaint(db, notifier, is_anonymous=True)
    notifier.calls.clear()

    await update_complaint_status(
        db, complaint.id, ComplaintStatusUpdate(status=ComplaintStatus.REVIEW), notifier
    )

    assert len(notifier.calls) == 0
