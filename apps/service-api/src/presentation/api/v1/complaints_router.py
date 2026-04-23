from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import ComplaintAlreadyClosed, ComplaintNotFound
from src.application.ports.notification_port import NotificationPort
from src.application.services import complaint_service
from src.domain.entities.complaint import ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate
from src.domain.enums import ComplaintStatus
from src.infrastructure.auth.jwt_validator import TokenPayload
from src.presentation.dependencies import get_current_user, get_db, get_notification_service

_ADMIN_ROLES = {"Admin", "ADMIN"}

router = APIRouter(prefix="/v1/complaints", tags=["complaints"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    data: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
    notifier: NotificationPort = Depends(get_notification_service),
):
    return await complaint_service.create_complaint(db, user_id=user.user_id, data=data, notifier=notifier)


@router.get("", response_model=list[ComplaintResponse])
async def list_complaints(
    complaint_status: Optional[ComplaintStatus] = None,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    return await complaint_service.get_complaints(
        db,
        user_id=user.user_id,
        role=user.role,
        status_filter=complaint_status,
    )


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: int,
    data: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
    notifier: NotificationPort = Depends(get_notification_service),
):
    if user.role not in _ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    try:
        return await complaint_service.update_complaint_status(
            db, complaint_id=complaint_id, data=data, notifier=notifier
        )
    except ComplaintNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    except ComplaintAlreadyClosed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Complaint is already closed")
