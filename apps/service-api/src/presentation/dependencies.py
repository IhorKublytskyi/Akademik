from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.ports.notification_port import NotificationPort
from src.application.services.rabbitmq_notification_service import (
    RabbitMQNotificationService,
)
from src.infrastructure.auth.jwt_validator import TokenPayload, decode_token
from src.infrastructure.database.connection import db

_bearer = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with db.session_factory() as session:
        yield session


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> TokenPayload:
    try:
        return decode_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_notification_service() -> NotificationPort:
    return RabbitMQNotificationService()
