import secrets

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import (
    QRCodeAccessDenied,
    QRCodeNotActive,
    QRCodeNotFound,
)
from src.domain.entities.qr import QRCodeCreate, QRCodeListResponse, QRCodeResponse
from src.domain.enums import QRStatus
from src.infrastructure.database.models.qr import QRCodeModel
from src.infrastructure.utils.datetime_utils import utc_now_naive

_ADMIN_ROLES = {"Admin", "ADMIN"}


async def create_qr_code(
    db: AsyncSession,
    user_id: int,
    role: str,
    data: QRCodeCreate,
) -> QRCodeModel:
    qr = QRCodeModel(
        user_id=user_id,
        room_id=data.room_id,
        token=secrets.token_urlsafe(32),
        access_type=data.access_type,
        valid_from=data.valid_from,
        valid_to=data.valid_to,
        status=QRStatus.ACTIVE,
    )
    db.add(qr)
    await db.commit()
    await db.refresh(qr)
    return qr


async def validate_qr_code(
    db: AsyncSession,
    token: str,
) -> QRCodeModel:
    result = await db.execute(select(QRCodeModel).where(QRCodeModel.token == token))
    qr = result.scalar_one_or_none()

    if qr is None:
        raise QRCodeNotFound("QR code not found")

    now = utc_now_naive()
    valid_to = qr.valid_to

    if qr.status != QRStatus.ACTIVE or valid_to < now:
        raise QRCodeNotActive("QR code is expired or already used/revoked")

    qr.status = QRStatus.USED
    await db.commit()
    await db.refresh(qr)
    return qr


async def list_qr_codes(
    db: AsyncSession,
    user_id: int,
    role: str,
    page: int,
    size: int,
) -> QRCodeListResponse:
    stmt = select(QRCodeModel)
    count_stmt = select(func.count()).select_from(QRCodeModel)

    if role not in _ADMIN_ROLES:
        stmt = stmt.where(QRCodeModel.user_id == user_id)
        count_stmt = count_stmt.where(QRCodeModel.user_id == user_id)

    total = (await db.execute(count_stmt)).scalar_one()
    items = (
        await db.execute(
            stmt.order_by(QRCodeModel.valid_from.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
    ).scalars().all()

    return QRCodeListResponse(
        items=[QRCodeResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
    )


async def revoke_qr_code(
    db: AsyncSession,
    qr_id: int,
    role: str,
) -> QRCodeModel:
    if role not in _ADMIN_ROLES:
        raise QRCodeAccessDenied("Only admins can revoke QR codes")

    qr = await db.get(QRCodeModel, qr_id)
    if qr is None:
        raise QRCodeNotFound(f"QR code {qr_id} not found")

    if qr.status != QRStatus.ACTIVE:
        raise QRCodeNotActive(f"QR code is already {qr.status.value.lower()}")

    qr.status = QRStatus.REVOKED
    await db.commit()
    await db.refresh(qr)
    return qr
