from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import (
    QRCodeAccessDenied,
    QRCodeNotActive,
    QRCodeNotFound,
)
from src.application.services import qr_service
from src.domain.entities.qr import (
    QRCodeCreate,
    QRCodeListResponse,
    QRCodeResponse,
    QRCodeValidateRequest,
    QRCodeValidateResponse,
)
from src.infrastructure.auth.jwt_validator import TokenPayload
from src.presentation.dependencies import get_current_user, get_db

router = APIRouter(prefix="/v1/qr-codes", tags=["qr-codes"])


@router.post("", response_model=QRCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_qr_code(
    data: QRCodeCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    return await qr_service.create_qr_code(db, user_id=user.user_id, role=user.role, data=data)


@router.post("/validate", response_model=QRCodeValidateResponse)
async def validate_qr_code(
    data: QRCodeValidateRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        qr = await qr_service.validate_qr_code(db, token=data.token)
    except QRCodeNotFound:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")
    except QRCodeNotActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="QR code is expired or already used/revoked",
        )

    return QRCodeValidateResponse(valid=True, user_id=qr.user_id, access_type=qr.access_type)


@router.get("", response_model=QRCodeListResponse)
async def list_qr_codes(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    return await qr_service.list_qr_codes(
        db, user_id=user.user_id, role=user.role, page=page, size=size
    )


@router.patch("/{qr_id}/revoke", response_model=QRCodeResponse)
async def revoke_qr_code(
    qr_id: int,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    try:
        return await qr_service.revoke_qr_code(db, qr_id=qr_id, role=user.role)
    except QRCodeAccessDenied:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can revoke QR codes")
    except QRCodeNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR code not found")
    except QRCodeNotActive as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
