import logging

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.services import qr_service
from src.presentation.dependencies import get_db, require_api_key

logger = logging.getLogger("integration")

router = APIRouter(prefix="/internal", tags=["internal"], dependencies=[Depends(require_api_key)])


@router.post("/users/{user_id}/deleted", status_code=status.HTTP_204_NO_CONTENT)
async def user_deleted(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> Response:
    revoked = await qr_service.revoke_user_qr_codes(db, user_id=user_id)
    logger.info("user_deleted: revoked %d active QR codes for user %d", revoked, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
