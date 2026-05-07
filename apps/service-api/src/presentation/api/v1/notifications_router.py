from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.services import notification_read_service
from src.domain.entities.notification import NotificationResponse
from src.infrastructure.auth.jwt_validator import TokenPayload
from src.presentation.dependencies import get_current_user, get_db

router = APIRouter(prefix="/v1/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    return await notification_read_service.get_notifications(
        db, user_id=user.user_id, role=user.role
    )
