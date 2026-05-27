import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from src.infrastructure.config import settings


class TokenPayload:
    def __init__(self, user_id: int, role: str, raw: dict):
        self.user_id = user_id
        self.role = role
        self.raw = raw


def decode_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["sub", "exp"]},
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
    except ExpiredSignatureError:
        raise InvalidTokenError("Token has expired")

    sub = payload.get("sub")
    if sub is None:
        raise InvalidTokenError("Missing subject claim")

    ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"

    role_claim = payload.get("role") or payload.get(ROLE_CLAIM) or ""
    role = role_claim[0] if isinstance(role_claim, list) else role_claim

    try:
        user_id = int(sub)
    except (ValueError, TypeError):
        raise InvalidTokenError("Subject claim is not a valid user ID")

    return TokenPayload(user_id=user_id, role=role, raw=payload)
