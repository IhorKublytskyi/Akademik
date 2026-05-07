import enum

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum

from src.infrastructure.database.connection import Base
from src.infrastructure.utils.datetime_utils import utc_now_naive


class IssuePriority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IssueStatus(str, enum.Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    PENDING = "PENDING"
    CLOSED = "CLOSED"


class IssueModel(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    room_id = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(1000), nullable=True)
    priority = Column(SQLEnum(IssuePriority), default=IssuePriority.NORMAL, nullable=False)
    status = Column(SQLEnum(IssueStatus), default=IssueStatus.NEW, nullable=False)
    created_at = Column(DateTime, default=utc_now_naive, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Issue(id={self.id}, status={self.status}, priority={self.priority})>"
