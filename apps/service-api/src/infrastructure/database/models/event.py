from sqlalchemy import Column, Integer, String, DateTime, func
from src.infrastructure.database.connection import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(String(500))
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)
    source = Column(String(20))  # USER, ADMIN
    type = Column(String(30))    # ROOM_INSPECTION, PAYMENT, OTHER
    created_at = Column(DateTime, server_default=func.now())