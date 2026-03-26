from sqlalchemy import Column, Integer, String, DateTime
from src.infrastructure.database.connection import Base

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    room_id = Column(Integer, nullable=False)
    token = Column(String(128), nullable=False)
    access_type = Column(String(20))  # BUILDING, ROOM
    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, nullable=False)
    status = Column(String(20))       # ACTIVE, USED, REVOKED