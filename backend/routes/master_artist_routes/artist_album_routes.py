from fastapi import APIRouter, Depends, HTTPException
from models.album import AlbumCreate, AlbumUpdate, AlbumInDB
from services.master_artist_service.artist_album_service import ArtistAlbumService
from services.master_artist_service.artist_song_service import ArtistSongService
from models.song import SongInDB 
from auth import get_current_artist
from typing import List
from pydantic import BaseModel

class AlbumsResponse(BaseModel):
    albums: List[AlbumInDB]
    total: int

router = APIRouter(prefix="/artist/albums", tags=["artist_albums"])

@router.get("", response_model=AlbumsResponse)
async def get_artist_albums(current_artist: dict = Depends(get_current_artist)):
    albums, total = ArtistAlbumService().get_artist_albums(current_artist["artist_id"])
    return {"albums": albums, "total": total}

@router.get("/{album_id}/songs", response_model=List[SongInDB])
async def get_songs_by_album(album_id: str, current_artist: dict = Depends(get_current_artist)):
    songs = ArtistSongService().get_songs_by_album(album_id, current_artist["artist_id"])
    return songs

@router.post("", response_model=dict)
async def create_album(album_data: AlbumCreate, current_artist: dict = Depends(get_current_artist)):
    album_id = ArtistAlbumService().create_album(current_artist["artist_id"], album_data)
    return {"id": album_id, "message": "Album created successfully"}

@router.put("/{album_id}", response_model=dict)
async def update_album(album_id: str, album_data: AlbumUpdate, current_artist: dict = Depends(get_current_artist)):
    updated = ArtistAlbumService().update_album(album_id, album_data, current_artist["artist_id"])
    if not updated:
        raise HTTPException(status_code=404, detail="Album not found or permission denied")
    return {"message": "Album updated successfully"}

@router.delete("/{album_id}", response_model=dict)
async def delete_album(album_id: str, current_artist: dict = Depends(get_current_artist)):
    deleted = ArtistAlbumService().delete_album(album_id, current_artist["artist_id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Album not found or permission denied")
    return {"message": "Album deleted successfully"}
