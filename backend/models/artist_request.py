from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

class ArtistRequestBase(BaseModel):
    
    name: str
    bio: Optional[str] = None
    genres: List[str] = []
    phone: Optional[str] = None
    image: Optional[str] = None
    social_links: List[HttpUrl] = []

class ArtistRequestCreate(ArtistRequestBase):
    pass

class ArtistRequestUpdate(BaseModel):
    status: str  # pending, approved, rejected
    updated_at: Optional[datetime] = None

class ArtistRequestInDB(ArtistRequestBase):
    id: str
    status: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    email: Optional[str] = None
    matched_artist_id: Optional[str] = None
    

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}