from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from models.playlist import PlaylistInDB
from services.admin_service.admin_playlist_service import AdminPlaylistService

router = APIRouter()
admin_playlist_service = AdminPlaylistService()

@router.get("/admin/playlists", response_model=List[PlaylistInDB])
async def admin_get_playlists(skip: int = 0, limit: int = 10, search: Optional[str] = ""):
    try:
        return admin_playlist_service.get_all_playlists(search=search, skip=skip, limit=limit)
    except Exception as e:
        print("[ERROR] Failed to fetch admin playlists:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")
