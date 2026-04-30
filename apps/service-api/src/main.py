from fastapi import FastAPI

from src.presentation.api.health_router import router as health_router
from src.presentation.api.v1 import me_router
from src.presentation.api.v1.complaints_router import router as complaints_router
from src.presentation.api.v1.events_router import router as events_router
from src.presentation.api.v1.issues_router import router as issues_router
from src.presentation.api.v1.qr_router import router as qr_router

app = FastAPI(title="Service API")

app.include_router(health_router)
app.include_router(me_router.router)
app.include_router(issues_router)
app.include_router(complaints_router)
app.include_router(events_router)
app.include_router(qr_router)
