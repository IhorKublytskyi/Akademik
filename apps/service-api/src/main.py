from fastapi import FastAPI

from src.infrastructure.config import settings
from src.presentation.api.health_router import router as health_router
from src.presentation.api.v1 import me_router

app = FastAPI(title="Service API")

app.include_router(health_router)
app.include_router(me_router.router)
