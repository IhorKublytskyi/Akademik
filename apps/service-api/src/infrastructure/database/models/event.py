import enum

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum

from src.infrastructure.utils.datetime_utils import utc_now_naive
from src.infrastructure.database.connection import Base


class EventSource(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class EventType(str, enum.Enum):
    ROOM_INSPECTION = "ROOM_INSPECTION"
    PAYMENT = "PAYMENT"
    OTHER = "OTHER"


class EventModel(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(String(500), nullable=True)
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)
    source = Column(SQLEnum(EventSource), default=EventSource.USER, nullable=False)
    type = Column(SQLEnum(EventType), default=EventType.OTHER, nullable=False)
    created_at = Column(DateTime, default=utc_now_naive, nullable=False)

    def __repr__(self):
        return f"<Event(id={self.id}, type={self.type}, source={self.source})>"