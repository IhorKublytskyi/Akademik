from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from src.domain.enums import ComplaintStatus


class UserNestedResponse(BaseModel):
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    room_id: int | None = Field(None, ge=1, le=2_147_483_647)
    content: str
    is_anonymous: bool = False


class ComplaintResponse(BaseModel):
    id: int
    user_id: int | None
    room_id: int | None
    content: str
    is_anonymous: bool
    status: ComplaintStatus
    created_at: datetime
    closed_at: datetime | None
    user: UserNestedResponse | None = None

    class Config:
        from_attributes = True

    @model_validator(mode="after")
    def mask_anonymous(self) -> "ComplaintResponse":
        if self.is_anonymous:
            self.user_id = None
            self.user = None
        return self


class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus


class ComplaintClose(BaseModel):
    reason: str | None = None
