from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models.song import SongCreate, SongUpdate, SongInDB
from services.master_artist_service.artist_song_service import ArtistSongService
from auth import get_current_artist
from typing import List, Optional
from pydantic import BaseModel
from cloudinary.uploader import upload
import os
from cloudinary import config

config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/artist/songs", tags=["artist_songs"])

class SongsResponse(BaseModel):
    songs: List[SongInDB]
    total: int

def get_song_service():
    try:
        return ArtistSongService()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize service: {str(e)}")

@router.get("", response_model=SongsResponse)
async def get_artist_songs(
    search: Optional[str] = None,
    sort: Optional[str] = None,
    skip: Optional[int] = 0,
    limit: Optional[int] = 10,
    service: ArtistSongService = Depends(get_song_service),
    current_artist: dict = Depends(get_current_artist)
):
    try:
        songs, total = service.get_artist_songs(current_artist["artist_id"], search, sort, skip, limit)
        return {"songs": songs, "total": total}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{song_id}", response_model=SongInDB)
async def get_song(
    song_id: str,
    service: ArtistSongService = Depends(get_song_service),
    current_artist: dict = Depends(get_current_artist)
):
    try:
        song = service.get_song_by_id(song_id, current_artist["artist_id"])
        if not song:
            raise HTTPException(status_code=404, detail="Song not found or permission denied")
        return song
    except ValueError as ve:
        print(f"ValueError in get_song {song_id}: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Unexpected error in get_song {song_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("", response_model=dict)
async def create_song(
    song_data: SongCreate,
    service: ArtistSongService = Depends(get_song_service),
    current_artist: dict = Depends(get_current_artist)
):
    try:
        song_id = service.create_song(current_artist["artist_id"], song_data)
        return {"id": song_id, "message": "Song created successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{song_id}", response_model=dict)
async def update_song(
    song_id: str,
    song_data: SongUpdate,
    service: ArtistSongService = Depends(get_song_service),
    current_artist: dict = Depends(get_current_artist)
):
    try:
        updated = service.update_song(song_id, song_data, current_artist["artist_id"])
        if not updated:
            raise HTTPException(status_code=404, detail="Song not found or permission denied")
        return {"message": "Song updated successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{song_id}", response_model=dict)
async def delete_song(
    song_id: str,
    service: ArtistSongService = Depends(get_song_service),
    current_artist: dict = Depends(get_current_artist)
):
    try:
        deleted = service.delete_song(song_id, current_artist["artist_id"])
        if not deleted:
            raise HTTPException(status_code=404, detail="Song not found or permission denied")
        return {"message": "Song deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/upload", response_model=dict)
async def upload_media(
    cover_art: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    current_artist: dict = Depends(get_current_artist)
):
    try:
        result = {}
        if cover_art:
            print(f"Uploading cover art for artist {current_artist['artist_id']}")
            cover_result = upload(cover_art.file, resource_type="image")
            result["coverArt"] = cover_result["secure_url"]
        if audio:
            print(f"Uploading audio for artist {current_artist['artist_id']}")
            audio_result = upload(audio.file, resource_type="raw")
            result["audioUrl"] = audio_result["secure_url"]
        return result
    except Exception as e:
        print(f"Error in upload_media: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")



