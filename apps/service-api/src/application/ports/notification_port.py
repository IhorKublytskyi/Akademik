from abc import ABC, abstractmethod

from src.domain.enums import NotificationChannel


class NotificationPort(ABC):
    @abstractmethod
    async def notify(
        self,
        user_id: int,
        title: str,
        content: str,
        channel: NotificationChannel = NotificationChannel.APP,
    ) -> None: ...
