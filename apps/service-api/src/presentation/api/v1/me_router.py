from fastapi import APIRouter, Depends

from src.infrastructure.auth.jwt_validator import TokenPayload
from src.presentation.dependencies import get_current_user

router = APIRouter(prefix="/v1/me", tags=["me"])


@router.get("")
def get_me(user: TokenPayload = Depends(get_current_user)):
    return {"user_id": user.user_id, "role": user.role}
