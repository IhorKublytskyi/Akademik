from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)  # NULL if anonymous
    room_id = Column(Integer, nullable=True)
    content = Column(String(1000), nullable=False)
    is_anonymous = Column(Boolean, nullable=False)
    status = Column(String(20))  # NEW, REVIEW, RESOLVED, CLOSED
    created_at = Column(DateTime, server_default=func.now())
    closed_at = Column(DateTime, nullable=True)