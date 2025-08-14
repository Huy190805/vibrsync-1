from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

# 🎵 Bổ sung model con cho bài hát
class SongInPlaylist(BaseModel):
    id: str
    title: str
    artist: str
    duration: Optional[int] = None
    releaseYear: Optional[int] = None

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}

class PlaylistBase(BaseModel):
    title: str
    description: Optional[str] = "A new playlist"
    creator: str = "You"
    songIds: Optional[List[str]] = []  # Danh sách ObjectId của bài hát
    coverArt: Optional[str] = "https://via.placeholder.com/640x640.png?text=Playlist+Cover"
    isPublic: Optional[bool] = True
    isShuffle: Optional[bool] = False

    @validator("title")
    def title_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    songIds: Optional[List[str]] = None
    isPublic: Optional[bool] = None
    coverArt: Optional[str] = None

# ✅ model chứa songs chi tiết
class PlaylistInDB(PlaylistBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    songs: List[SongInPlaylist] = []  # ✅ thêm vào đây

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ✅ nếu bạn dùng model output khác
class PlaylistOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    creator: str
    songIds: Optional[List[str]]
    coverArt: Optional[str]
    isPublic: Optional[bool]
    isShuffle: Optional[bool]
    created_at: datetime
    updated_at: Optional[datetime] = None
    songs: List[SongInPlaylist] = []  # ✅ thêm vào đây luôn

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}
