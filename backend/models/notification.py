from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: Optional[str] = None

class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: Optional[str]
    read: bool
    created_at: Optional[datetime]

    class Config:
        arbitrary_types_allowed = True
