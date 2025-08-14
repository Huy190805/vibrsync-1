from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

class ArtistBase(BaseModel):
    name: str
    bio: Optional[str] = None
    genres: List[str] = []
    followers: int = 0
    phone: Optional[str] = None

class ArtistCreate(ArtistBase):
    image: Optional[str] = None

class ArtistUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    image: Optional[str] = None
    genres: Optional[List[str]] = None
    followers: Optional[int] = None

class SongData(BaseModel):
    id: str
    title: str
    album: Optional[str] = None
    releaseYear: int
    coverArt: Optional[str] = None
    audioUrl: Optional[str] = None
    genre: str

class AlbumData(BaseModel):
    id: str
    title: str
    releaseYear: int
    coverArt: Optional[str] = None

class ArtistInDB(ArtistBase):
    id: str
    image: Optional[str] = None
    songs: List[SongData] = []
    albums: List[AlbumData] = []
    followers: int = 0
    follower_ids: Optional[List[str]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by_admin: bool = False
    claimed_by_user_id: Optional[str] = None
    isFollowing: Optional[bool] = False

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}