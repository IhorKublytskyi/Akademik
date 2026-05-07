import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://akademik:secret@postgres:5432/akademik_db",
    )
    rabbitmq_url: str = os.getenv(
        "RABBITMQ_URL",
        "amqp://admin:secret@rabbitmq:5672",
    )
    jwt_secret: str = os.getenv("JWT_SECRET", "supersecretkey")
    jwt_algorithm: str = "HS256"

    # Must match Jwt:Issuer and Jwt:Audience in core-api appsettings.json
    jwt_issuer: str = os.getenv("JWT_ISSUER", "akademik")
    jwt_audience: str = os.getenv("JWT_AUDIENCE", "akademik")


settings = Settings()
