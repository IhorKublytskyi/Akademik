from fastapi import FastAPI

from src.infrastructure.config import settings
from src.presentation.api.health_router import health
from src.presentation.api.v1 import me_router

app = FastAPI(title="Service API")

app.include_router(health.router)
app.include_router(me_router.router)
