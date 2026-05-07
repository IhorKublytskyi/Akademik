from datetime import datetime

from pydantic import BaseModel

from src.domain.enums import IssuePriority, IssueStatus


class IssueCreate(BaseModel):
    room_id: int
    title: str
    description: str | None = None
    priority: IssuePriority = IssuePriority.NORMAL


class IssueResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    title: str
    description: str | None
    priority: IssuePriority
    status: IssueStatus
    created_at: datetime
    closed_at: datetime | None

    class Config:
        from_attributes = True


class IssueStatusUpdate(BaseModel):
    status: IssueStatus


class IssueClose(BaseModel):
    reason: str | None = None
