from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.exceptions.exceptions import EventAccessDenied, EventNotFound
from src.application.ports.notification_port import NotificationPort
from src.domain.entities.event import EventCreate, EventUpdate, RoomInspectionCreate
from src.domain.enums import EventSource, EventType
from src.infrastructure.database.models.event import EventModel


async def get_user_events(
    db: AsyncSession,
    user_id: int,
) -> list[EventModel]:
    stmt = (
        select(EventModel)
        .where(EventModel.user_id == user_id)
        .order_by(EventModel.start_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_event(
    db: AsyncSession,
    user_id: int,
    data: EventCreate,
) -> EventModel:
    event = EventModel(
        user_id=user_id,
        title=data.title,
        description=data.description,
        start_at=data.start_at,
        end_at=data.end_at,
        source=EventSource.USER,
        type=data.type,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def update_event(
    db: AsyncSession,
    event_id: int,
    user_id: int,
    data: EventUpdate,
) -> EventModel:
    event = await db.get(EventModel, event_id)
    if event is None:
        raise EventNotFound(f"Event {event_id} not found")

    if event.user_id != user_id or event.source != EventSource.USER:
        raise EventAccessDenied("You can only edit your own personal events")

    if data.title is not None:
        event.title = data.title
    if data.description is not None:
        event.description = data.description
    if data.start_at is not None:
        event.start_at = data.start_at
    if data.end_at is not None:
        event.end_at = data.end_at

    await db.commit()
    await db.refresh(event)
    return event


async def delete_event(
    db: AsyncSession,
    event_id: int,
    user_id: int,
) -> None:
    event = await db.get(EventModel, event_id)
    if event is None:
        raise EventNotFound(f"Event {event_id} not found")

    if event.user_id != user_id or event.source != EventSource.USER:
        raise EventAccessDenied("You can only delete your own personal events")

    await db.delete(event)
    await db.commit()


async def create_room_inspections(
    db: AsyncSession,
    data: RoomInspectionCreate,
    notifier: NotificationPort,
) -> list[EventModel]:
    events = []
    for uid in data.user_ids:
        event = EventModel(
            user_id=uid,
            title=data.title,
            description=data.description,
            start_at=data.start_at,
            end_at=data.end_at,
            source=EventSource.ADMIN,
            type=EventType.ROOM_INSPECTION,
        )
        db.add(event)
        events.append(event)

    await db.flush()

    for uid in data.user_ids:
        await notifier.notify(
            user_id=uid,
            title="Запланирован контроль комнаты",
            content=f"{data.title} — {data.start_at.strftime('%d.%m.%Y %H:%M')}",
        )

    await db.commit()

    for event in events:
        await db.refresh(event)

    return events
