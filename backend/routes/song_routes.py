from fastapi import APIRouter, HTTPException, Depends
from models.song import SongCreate, SongUpdate, SongInDB
from services.song_service import SongService
from database.repositories.song_repository import SongRepository
from database.repositories.artist_repository import ArtistRepository
from auth import get_current_user
from pydantic import BaseModel
from typing import List
import random

router = APIRouter(prefix="/songs", tags=["songs"])

class SongsResponse(BaseModel):
    songs: List[SongInDB]
    total: int

def get_song_service():
    return SongService(SongRepository(), ArtistRepository())

@router.get("", response_model=SongsResponse)
async def get_songs(sort: str = None, limit: int = None, service: SongService = Depends(get_song_service)):
    try:
        songs = service.get_all_songs(sort, limit)
        return {"songs": songs, "total": len(songs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{id}", response_model=SongInDB)
async def get_song(id: str, service: SongService = Depends(get_song_service)):
    song = service.get_song_by_id(id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.post("", dependencies=[Depends(get_current_user)])
async def create_song(song_data: SongCreate, service: SongService = Depends(get_song_service)):
    try:
        song_id = service.create_song(song_data)
        return {"id": song_id, "message": "Song created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{id}", dependencies=[Depends(get_current_user)])
async def update_song(id: str, song_data: SongUpdate, service: SongService = Depends(get_song_service)):
    try:
        if not service.update_song(id, song_data):
            raise HTTPException(status_code=404, detail="Song not found")
        return {"message": "Song updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete_song(id: str, service: SongService = Depends(get_song_service)):
    if not service.delete_song(id):
        raise HTTPException(status_code=404, detail="Song not found")
    return {"message": "Song deleted successfully"}

@router.get("/random", response_model=SongInDB)
async def get_random_song(service: SongService = Depends(get_song_service)):
    songs = service.get_all_songs()
    if not songs:
        raise HTTPException(status_code=404, detail="No songs found")
    return random.choice(songs)

@router.get("/{id}/lyrics")
async def get_song_lyrics(id: str, service: SongService = Depends(get_song_service)):
    song = service.get_song_by_id(id)
    if not song or not song.lyrics_lrc:
        raise HTTPException(status_code=404, detail="Lyrics not found")
    return {"lyrics_lrc": song.lyrics_lrc}
