from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import IssueAlreadyClosed, IssueNotFound
from src.application.services import issue_service
from src.domain.entities.issue import IssueCreate, IssueResponse, IssueStatusUpdate
from src.domain.enums import IssueStatus, UserRole
from src.infrastructure.auth.jwt_validator import TokenPayload
from src.presentation.dependencies import get_current_user, get_db

_ADMIN_ROLES = {"Admin", "ADMIN"}

router = APIRouter(prefix="/v1/issues", tags=["issues"])


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    data: IssueCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    issue = await issue_service.create_issue(db, user_id=user.user_id, data=data)
    return issue


@router.get("", response_model=list[IssueResponse])
async def list_issues(
    issue_status: Optional[IssueStatus] = None,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    issues = await issue_service.get_issues(
        db,
        user_id=user.user_id,
        role=user.role,
        status_filter=issue_status,
    )
    return issues


@router.patch("/{issue_id}/status", response_model=IssueResponse)
async def update_issue_status(
    issue_id: int,
    data: IssueStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    if user.role not in _ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    try:
        issue = await issue_service.update_issue_status(db, issue_id=issue_id, data=data)
    except IssueNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    except IssueAlreadyClosed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Issue is already closed")

    return issue
