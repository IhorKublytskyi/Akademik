from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import EventAccessDenied, EventNotFound
from src.application.ports.notification_port import NotificationPort
from src.application.services import event_service
from src.domain.entities.event import EventCreate, EventResponse, EventUpdate, RoomInspectionCreate
from src.infrastructure.auth.jwt_validator import TokenPayload
from src.presentation.dependencies import get_current_user, get_db, get_notification_service

_ADMIN_ROLES = {"Admin", "ADMIN"}

router = APIRouter(tags=["events"])


@router.get("/v1/events", response_model=list[EventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    return await event_service.get_user_events(db, user_id=user.user_id)


@router.post("/v1/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    return await event_service.create_event(db, user_id=user.user_id, data=data)


@router.patch("/v1/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    try:
        return await event_service.update_event(db, event_id=event_id, user_id=user.user_id, data=data)
    except EventNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    except EventAccessDenied:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own personal events")


@router.delete("/v1/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    try:
        await event_service.delete_event(db, event_id=event_id, user_id=user.user_id)
    except EventNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    except EventAccessDenied:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own personal events")


@router.post(
    "/v1/admin/events/room-inspections",
    response_model=list[EventResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_room_inspections(
    data: RoomInspectionCreate,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
    notifier: NotificationPort = Depends(get_notification_service),
):
    if user.role not in _ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    return await event_service.create_room_inspections(db, data=data, notifier=notifier)
