from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from src.domain.enums import ComplaintStatus


class ComplaintCreate(BaseModel):
    room_id: Optional[int] = None
    content: str
    is_anonymous: bool = False


class ComplaintResponse(BaseModel):
    id: int
    user_id: Optional[int]
    room_id: Optional[int]
    content: str
    is_anonymous: bool
    status: ComplaintStatus
    created_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ComplaintClose(BaseModel):
    reason: Optional[str] = None