from datetime import datetime

from pydantic import BaseModel

from src.domain.enums import ComplaintStatus


class ComplaintCreate(BaseModel):
    room_id: int | None = None
    content: str
    is_anonymous: bool = False


class ComplaintResponse(BaseModel):
    id: int
    user_id: int | None
    room_id: int | None
    content: str
    is_anonymous: bool
    status: ComplaintStatus
    created_at: datetime
    closed_at: datetime | None

    class Config:
        from_attributes = True


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus


class ComplaintClose(BaseModel):
    reason: str | None = None
