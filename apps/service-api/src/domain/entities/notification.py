from datetime import datetime

from pydantic import BaseModel

from src.domain.enums import NotificationChannel, NotificationStatus


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    channel: NotificationChannel
    title: str
    content: str | None
    status: NotificationStatus
    scheduled_at: datetime | None
    sent_at: datetime | None

    class Config:
        from_attributes = True
