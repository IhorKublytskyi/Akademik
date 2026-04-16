import enum


class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"


class IssueStatus(str, enum.Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    PENDING = "PENDING"
    CLOSED = "CLOSED"


class IssuePriority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ComplaintStatus(str, enum.Enum):
    NEW = "NEW"
    REVIEW = "REVIEW"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class QRStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    USED = "USED"
    REVOKED = "REVOKED"


class QRAccessType(str, enum.Enum):
    BUILDING = "BUILDING"
    ROOM = "ROOM"


class NotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"


class NotificationChannel(str, enum.Enum):
    EMAIL = "EMAIL"
    SMS = "SMS"
    APP = "APP"


class EventSource(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class EventType(str, enum.Enum):
    ROOM_INSPECTION = "ROOM_INSPECTION"
    PAYMENT = "PAYMENT"
    OTHER = "OTHER"