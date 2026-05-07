from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.domain.enums import NotificationChannel, NotificationStatus


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    channel: NotificationChannel
    title: str
    content: Optional[str]
    status: NotificationStatus
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]

    class Config:
        from_attributes = True
