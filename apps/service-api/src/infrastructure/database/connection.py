import re

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from src.infrastructure.config import settings


class Base(DeclarativeBase):
    pass


class Database:
    def __init__(self, database_url: str):
        _url = re.sub(r"^postgres(?:ql)?://", "postgresql+asyncpg://", database_url)
        self.engine = create_async_engine(_url, echo=True, pool_pre_ping=True)
        self.session_factory = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def get_session(self) -> AsyncSession:
        async with self.session_factory() as session:
            yield session

    async def health_check(self) -> bool:
        try:
            async with self.engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            print(f"Database health check failed: {e}")
            return False

db = Database(settings.database_url)        
