import enum

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum

from src.infrastructure.database.connection import Base


class QRAccessType(str, enum.Enum):
    BUILDING = "BUILDING"
    ROOM = "ROOM"


class QRStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    USED = "USED"
    REVOKED = "REVOKED"


class QRCodeModel(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    room_id = Column(Integer, nullable=False)
    token = Column(String(128), nullable=False, unique=True)
    access_type = Column(SQLEnum(QRAccessType), default=QRAccessType.BUILDING, nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, nullable=False)
    status = Column(SQLEnum(QRStatus), default=QRStatus.ACTIVE, nullable=False)

    def __repr__(self):
        return f"<QRCode(id={self.id}, status={self.status}, access_type={self.access_type})>"
