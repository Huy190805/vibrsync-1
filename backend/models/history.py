from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ListenHistoryModel(BaseModel):
    user_id: str = Field(..., example="665f3d8fb22d6cf5a3c3b9a0")
    song_id: str = Field(..., example="665f3e1db22d6cf5a3c3b9a5")
    listened_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True  # ✅ Nếu dùng Pydantic V2
