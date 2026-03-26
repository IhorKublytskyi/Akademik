from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok", "service": "service-api", "timestamp": datetime.now(timezone.utc)}