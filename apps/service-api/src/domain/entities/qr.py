from datetime import datetime

from pydantic import BaseModel, field_validator, model_validator

from src.domain.enums import QRAccessType, QRStatus


class QRCodeCreate(BaseModel):
    room_id: int
    access_type: QRAccessType = QRAccessType.BUILDING
    valid_from: datetime
    valid_to: datetime

    @field_validator('valid_from', 'valid_to', mode='before')
    @classmethod
    def strip_timezone(cls, v: str | datetime) -> datetime:
        if isinstance(v, str):
            try:
                v = datetime.fromisoformat(v.replace("Z", "+00:00"))
            except ValueError:
                pass

        if isinstance(v, datetime) and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v

    @model_validator(mode="after")
    def check_dates(self) -> "QRCodeCreate":
        if self.valid_to <= self.valid_from:
            raise ValueError("valid_to must be after valid_from")
        return self


class QRCodeResponse(BaseModel):
    id: int
    user_id: int
    room_id: int
    token: str
    access_type: QRAccessType
    valid_from: datetime
    valid_to: datetime
    status: QRStatus

    class Config:
        from_attributes = True


class QRCodeValidateRequest(BaseModel):
    token: str


class QRCodeValidateResponse(BaseModel):
    valid: bool
    user_id: int
    access_type: QRAccessType


class QRCodeListResponse(BaseModel):
    items: list[QRCodeResponse]
    total: int
    page: int
    size: int
