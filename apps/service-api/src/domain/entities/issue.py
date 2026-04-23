from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from src.domain.enums import IssuePriority, IssueStatus


class IssueCreate(BaseModel):
    room_id: int
    title: str
    description: Optional[str] = None
    priority: IssuePriority = IssuePriority.NORMAL


class IssueResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    title: str
    description: Optional[str]
    priority: IssuePriority
    status: IssueStatus
    created_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


class IssueStatusUpdate(BaseModel):
    status: IssueStatus


class IssueClose(BaseModel):
    reason: Optional[str] = None