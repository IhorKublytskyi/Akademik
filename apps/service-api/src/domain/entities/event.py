from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.domain.enums import EventSource, EventType


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_at: datetime
    end_at: datetime
    type: EventType = EventType.OTHER


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None


class EventResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    start_at: datetime
    end_at: datetime
    source: EventSource
    type: EventType
    created_at: datetime

    class Config:
        from_attributes = True


class RoomInspectionCreate(BaseModel):
    user_ids: list[int]
    title: str
    description: Optional[str] = None
    start_at: datetime
    end_at: datetime
