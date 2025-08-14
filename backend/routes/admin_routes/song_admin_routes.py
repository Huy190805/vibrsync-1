from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from models.song import SongCreate, SongUpdate, SongInDB
from services.admin_service.admin_song_service import AdminSongService  # Cập nhật đường dẫn
from database.repositories.song_repository import SongRepository
from auth import get_current_admin
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from cloudinary.uploader import upload
import os
from cloudinary import config

config(cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"), 
       api_key=os.getenv("CLOUDINARY_API_KEY"), 
       api_secret=os.getenv("CLOUDINARY_API_SECRET"))

router = APIRouter(prefix="/admin/songs", tags=["admin_songs"])

class SongsResponse(BaseModel):
    songs: List[SongInDB]
    total: int

def get_song_service():
    try:
        repository = SongRepository()
        return AdminSongService(repository)
    except Exception as e:
        print(f"Error initializing song service: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize service: {str(e)}")

@router.get("", response_model=SongsResponse)
async def get_songs(
    search: Optional[str] = None,
    sort: Optional[str] = None,
    skip: Optional[int] = 0,
    limit: Optional[int] = 10,
    service: AdminSongService = Depends(get_song_service),
    admin=Depends(get_current_admin)
):
    try:
        songs, total = service.get_all_songs(search, sort, skip, limit)
        return {"songs": songs, "total": total}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{id}", response_model=SongInDB)
async def get_song(id: str, service: AdminSongService = Depends(get_song_service), admin=Depends(get_current_admin)):
    try:
        song = service.get_song_by_id(id)
        if not song:
            raise HTTPException(status_code=404, detail="Song not found")
        return song
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("", response_model=dict)
async def create_song(
    song_data: SongCreate,
    service: AdminSongService = Depends(get_song_service),
    admin=Depends(get_current_admin)
):
    try:
        song_id = service.create_song(song_data)
        return {"id": song_id, "message": "Song created successfully"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/upload", response_model=dict)
async def upload_media(
    cover_art: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    service: AdminSongService = Depends(get_song_service),
    admin=Depends(get_current_admin)
):
    try:
        result = {}
        if cover_art:
            print(f"Uploading cover art for admin {admin['email']}")
            cover_result = upload(cover_art.file, resource_type="image")
            result["coverArt"] = cover_result["secure_url"]
        if audio:
            print(f"Uploading audio for admin {admin['email']}")
            audio_result = upload(audio.file, resource_type="raw")  
            result["audioUrl"] = audio_result["secure_url"]
        return result
    except Exception as e:
        print(f"Error in upload_media: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.put("/{id}", response_model=dict)
async def update_song(
    id: str,
    song_data: SongUpdate,
    service: AdminSongService = Depends(get_song_service),
    admin=Depends(get_current_admin)
):
    try:
        if not service.update_song(id, song_data):
            raise HTTPException(status_code=404, detail="Song not found")
        print(f"Song {id} updated by admin {admin['email']}")
        return {"message": "Song updated successfully"}
    except ValueError as ve:
        print(f"ValueError in update_song {id}: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Unexpected error in update_song {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{id}", response_model=dict)
async def delete_song(id: str, service: AdminSongService = Depends(get_song_service), admin=Depends(get_current_admin)):
    try:
        if not service.delete_song(id):
            raise HTTPException(status_code=404, detail="Song not found")
        print(f"Song {id} deleted by admin {admin['email']}")
        return {"message": "Song deleted successfully"}
    except Exception as e:
        print(f"Error in delete_song {id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
