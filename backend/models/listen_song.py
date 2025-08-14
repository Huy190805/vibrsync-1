from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ListenSongRequest(BaseModel):
    user_id: str
    song_id: Optional[str] = None  # For listen or song search
    artist_id: Optional[str] = None  # For artist search
    listened_at: datetime
    type: Optional[str] = "listen"  # listen | search 