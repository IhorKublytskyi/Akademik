import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from src.infrastructure.config import settings


class TokenPayload:
    def __init__(self, user_id: int, role: str, raw: dict):
        self.user_id = user_id
        self.role = role
        self.raw = raw


def decode_token(token: str) -> TokenPayload:
    """
    Validates a JWT issued by core-api (ASP.NET, HS256).

    Expected claims:
      sub    — user ID as string          (JwtRegisteredClaimNames.Sub)
      email  — user email                 (JwtRegisteredClaimNames.Email)
      role   — "Admin" or "Resident"      (ClaimTypes.Role → mapped to "role" by JwtSecurityTokenHandler)
      status — "Active" or "Blocked"      (custom claim)
      iss    — "akademik"
      aud    — "akademik"
      exp    — expiration timestamp
    """
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

    # ClaimTypes.Role in .NET can be deserialized as a list by PyJWT
    role_claim = payload.get("role", "")
    role = role_claim[0] if isinstance(role_claim, list) else role_claim

    try:
        user_id = int(sub)
    except (ValueError, TypeError):
        raise InvalidTokenError("Subject claim is not a valid user ID")

    return TokenPayload(user_id=user_id, role=role, raw=payload)
