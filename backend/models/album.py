from pydantic import BaseModel, validator, HttpUrl
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

class AlbumBase(BaseModel):
    title: str
    artist_id: str
    cover_art: Optional[HttpUrl] = None  # Cho phép cover_art là None
    release_year: int
    genres: List[str]
    songs: List[str]  # Danh sách ObjectId của bài hát

    @validator("release_year")
    def validate_release_year(cls, v):
        if v < 1900 or v > datetime.now().year + 1:
            raise ValueError("Invalid release year")
        return v

class AlbumCreate(AlbumBase):
    pass

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    artist_id: Optional[str] = None
    cover_art: Optional[HttpUrl] = None  
    release_year: Optional[int] = None
    genres: Optional[List[str]] = None
    songs: Optional[List[str]] = None

class AlbumInDB(AlbumBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}