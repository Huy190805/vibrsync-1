from fastapi import APIRouter, HTTPException, Depends
from models.playlist import PlaylistCreate, PlaylistUpdate, PlaylistInDB
from services.admin_service.admin_playlist_service import AdminPlaylistService
from database.repositories.playlist_repository import PlaylistRepository
from auth import get_current_admin
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/admin/playlists", tags=["admin_playlists"])

class PlaylistsResponse(BaseModel):
    playlists: List[PlaylistInDB]
    total: int

# Khởi tạo service
def get_playlist_service():
    try:
        repo = PlaylistRepository()
        return AdminPlaylistService(repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize service: {str(e)}")


@router.get("", response_model=PlaylistsResponse)
async def get_playlists(
    search: Optional[str] = None,
    sort: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    service: AdminPlaylistService = Depends(get_playlist_service),
    admin=Depends(get_current_admin)
):
    try:
        playlists, total = service.get_all_playlists(search, sort, skip, limit)
        return {"playlists": playlists, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_model=PlaylistInDB)
async def get_playlist_by_id(
    id: str,
    service: AdminPlaylistService = Depends(get_playlist_service),
    admin=Depends(get_current_admin)
):
    try:
        playlist = service.get_playlist_by_id(id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        return playlist
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=dict)
async def create_playlist(
    data: PlaylistCreate,
    service: AdminPlaylistService = Depends(get_playlist_service),
    admin=Depends(get_current_admin)
):
    try:
        playlist_id = service.create_playlist(data)
        return {"id": playlist_id, "message": "Playlist created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}", response_model=dict)
async def update_playlist(
    id: str,
    data: PlaylistUpdate,
    service: AdminPlaylistService = Depends(get_playlist_service),
    admin=Depends(get_current_admin)
):
    try:
        success = service.update_playlist(id, data)
        if not success:
            raise HTTPException(status_code=404, detail="Playlist not found")
        return {"message": "Playlist updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}", response_model=dict)
async def delete_playlist(
    id: str,
    service: AdminPlaylistService = Depends(get_playlist_service),
    admin=Depends(get_current_admin)
):
    try:
        success = service.delete_playlist(id)
        if not success:
            raise HTTPException(status_code=404, detail="Playlist not found")
        return {"message": "Playlist deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
