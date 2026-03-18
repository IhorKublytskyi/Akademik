from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    channel = Column(String(10))       # EMAIL, SMS, APP
    title = Column(String(120), nullable=False)
    content = Column(String(500))
    status = Column(String(20))        # PENDING, SENT, FAILED
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)