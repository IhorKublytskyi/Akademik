from fastapi import FastAPI
from src.presentation.api.health_router import health

app = FastAPI(title="Service API")

app.include_router(health.router)