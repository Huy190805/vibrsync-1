from fastapi import APIRouter, HTTPException, Depends
from services.admin_service.admin_album_service import AdminAlbumService
from database.repositories.album_repository import AlbumRepository
from models.album import AlbumCreate, AlbumUpdate, AlbumInDB
from auth import get_current_admin

router = APIRouter(prefix="/admin/albums", tags=["admin_albums"])

service = AdminAlbumService(AlbumRepository())

@router.get("", response_model=dict)
async def get_albums(skip: int = 0, limit: int = 20):
    albums = service.get_all_albums()
    return {"albums": albums, "total": len(albums)}

@router.get("/search", response_model=dict)
async def search_albums(name: str, skip: int = 0, limit: int = 20, dependencies=[Depends(get_current_admin)]):
    albums = service.search_albums(name)
    return {"albums": albums, "total": len(albums)}

@router.post("", dependencies=[Depends(get_current_admin)], response_model=dict)
async def create_album(album: AlbumCreate):
    try:
        album_id = service.create_album(album)
        return {"id": album_id, "message": "Album created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{album_id}", response_model=dict, dependencies=[Depends(get_current_admin)])
async def update_album(album_id: str, album: AlbumUpdate):
    updated = service.update_album(album_id, album)
    if not updated:
        raise HTTPException(status_code=404, detail="Album not found")
    return {"message": "Album updated successfully"}


@router.delete("/{album_id}", dependencies=[Depends(get_current_admin)], response_model=dict)
async def delete_album(album_id: str):
    deleted = service.delete_album(album_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Album not found")
    return {"message": "Album deleted successfully"}