from sqlalchemy import Column, Integer, String, DateTime, func
from src.infrastructure.database.connection import Base

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    room_id = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(1000))
    priority = Column(String(20))  # LOW, NORMAL, HIGH, CRITICAL
    status = Column(String(20))    # NEW, IN_PROGRESS, PENDING, CLOSED
    created_at = Column(DateTime, server_default=func.now())
    closed_at = Column(DateTime, nullable=True)