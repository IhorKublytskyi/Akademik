import enum

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum

from src.infrastructure.utils.datetime_utils import utc_now_naive
from src.infrastructure.database.connection import Base


class NotificationChannel(str, enum.Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"
    APP = "APP"


class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    channel = Column(SQLEnum(NotificationChannel), default=NotificationChannel.APP, nullable=False)
    title = Column(String(120), nullable=False)
    content = Column(String(500), nullable=True)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<Notification(id={self.id}, channel={self.channel}, status={self.status})>"