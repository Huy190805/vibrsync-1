from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Follow(BaseModel):
    user_id: str
    artist_id: str
    followed_at: Optional[datetime] = None
