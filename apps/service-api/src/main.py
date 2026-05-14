from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from src.presentation.api.health_router import router as health_router
from src.presentation.api.v1 import me_router
from src.presentation.api.v1.complaints_router import router as complaints_router
from src.presentation.api.v1.events_router import router as events_router
from src.presentation.api.v1.issues_router import router as issues_router
from src.presentation.api.v1.notifications_router import router as notifications_router
from src.presentation.api.v1.qr_router import router as qr_router

app = FastAPI(title="Service API")

app.include_router(health_router, prefix="/api/service")
app.include_router(me_router.router, prefix="/api/service")
app.include_router(issues_router, prefix="/api/service")
app.include_router(complaints_router, prefix="/api/service")
app.include_router(events_router, prefix="/api/service")
app.include_router(qr_router, prefix="/api/service")
app.include_router(notifications_router, prefix="/api/service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)