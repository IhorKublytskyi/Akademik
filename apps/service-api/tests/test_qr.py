from datetime import datetime, timedelta

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import (
    QRCodeAccessDenied,
    QRCodeNotActive,
    QRCodeNotFound,
)
from src.application.services.qr_service import (
    create_qr_code,
    revoke_qr_code,
    validate_qr_code,
)
from src.domain.entities.qr import QRCodeCreate
from src.domain.enums import QRAccessType, QRStatus
from src.infrastructure.utils.datetime_utils import utc_now_naive


def _now() -> datetime:
    return utc_now_naive()


def _active_data(offset_hours: int = 0) -> QRCodeCreate:
    now = _now()
    return QRCodeCreate(
        room_id=1,
        access_type=QRAccessType.BUILDING,
        valid_from=now - timedelta(hours=1) + timedelta(hours=offset_hours),
        valid_to=now + timedelta(hours=2) + timedelta(hours=offset_hours),
    )


@pytest.mark.asyncio
async def test_create_qr_persisted(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())

    assert qr.id is not None
    assert qr.status == QRStatus.ACTIVE
    assert qr.token != ""


@pytest.mark.asyncio
async def test_validate_qr_marks_used(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())
    validated = await validate_qr_code(db, qr.token)

    assert validated.status == QRStatus.USED


@pytest.mark.asyncio
async def test_double_validate_raises(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())
    await validate_qr_code(db, qr.token)

    with pytest.raises(QRCodeNotActive):
        await validate_qr_code(db, qr.token)


@pytest.mark.asyncio
async def test_validate_expired_qr_raises(db: AsyncSession):
    now = _now()
    data = QRCodeCreate(
        room_id=1,
        access_type=QRAccessType.BUILDING,
        valid_from=now - timedelta(hours=3),
        valid_to=now - timedelta(hours=1),
    )
    qr = await create_qr_code(db, user_id=1, role="Resident", data=data)

    with pytest.raises(QRCodeNotActive):
        await validate_qr_code(db, qr.token)


@pytest.mark.asyncio
async def test_validate_unknown_token_raises(db: AsyncSession):
    with pytest.raises(QRCodeNotFound):
        await validate_qr_code(db, "nonexistent-token-xyz")


@pytest.mark.asyncio
async def test_admin_revoke_qr(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())
    revoked = await revoke_qr_code(db, qr.id, role="Admin")

    assert revoked.status == QRStatus.REVOKED


@pytest.mark.asyncio
async def test_non_admin_revoke_raises(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())

    with pytest.raises(QRCodeAccessDenied):
        await revoke_qr_code(db, qr.id, role="Resident")


@pytest.mark.asyncio
async def test_validate_revoked_qr_raises(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())
    await revoke_qr_code(db, qr.id, role="Admin")

    with pytest.raises(QRCodeNotActive):
        await validate_qr_code(db, qr.token)


@pytest.mark.asyncio
async def test_revoke_already_used_raises(db: AsyncSession):
    qr = await create_qr_code(db, user_id=1, role="Resident", data=_active_data())
    await validate_qr_code(db, qr.token)

    with pytest.raises(QRCodeNotActive):
        await revoke_qr_code(db, qr.id, role="Admin")
