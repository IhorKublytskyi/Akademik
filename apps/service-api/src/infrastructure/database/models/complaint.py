import enum

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum

from src.infrastructure.database.connection import Base
from src.infrastructure.utils.datetime_utils import utc_now_naive


class ComplaintStatus(str, enum.Enum):
    NEW = "NEW"
    REVIEW = "REVIEW"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class ComplaintModel(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    room_id = Column(Integer, nullable=True)
    content = Column(String(1000), nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    status = Column(SQLEnum(ComplaintStatus), default=ComplaintStatus.NEW, nullable=False)
    created_at = Column(DateTime, default=utc_now_naive, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Complaint(id={self.id}, anonymous={self.is_anonymous}, status={self.status})>"
