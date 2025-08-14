from fastapi import APIRouter, HTTPException, Depends
from services.admin_service.admin_artist_service import AdminArtistService
from database.repositories.artist_repository import ArtistRepository
from models.artist import ArtistCreate, ArtistUpdate, ArtistInDB
from auth import get_current_admin

router = APIRouter(prefix="/admin/artists", tags=["admin_artists"])

service = AdminArtistService(ArtistRepository())

@router.get("", response_model=dict)
async def get_artists(skip: int = 0, limit: int = 20):
    artists = service.get_all_artists()
    return {"artists": artists, "total": len(artists)}

@router.get("/search", response_model=dict)
async def search_artists(name: str, skip: int = 0, limit: int = 20, dependencies=[Depends(get_current_admin)]):
    artists = service.search_artists(name)
    return {"artists": artists, "total": len(artists)}

@router.get("/{artist_id}", response_model=ArtistInDB)  # Thêm endpoint
async def get_artist_by_id(artist_id: str):
    artist = service.get_artist_by_id(artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist

@router.post("", dependencies=[Depends(get_current_admin)], response_model=dict)
async def create_artist(artist: ArtistCreate):
    try:
        artist_id = service.create_artist(artist)
        return {"id": artist_id, "message": "Artist created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{artist_id}", dependencies=[Depends(get_current_admin)], response_model=dict)
async def update_artist(artist_id: str, artist: ArtistUpdate):
    updated = service.update_artist(artist_id, artist)
    if not updated:
        raise HTTPException(status_code=404, detail="Artist not found")
    return {"message": "Artist updated successfully"}

@router.delete("/{artist_id}", dependencies=[Depends(get_current_admin)], response_model=dict)
async def delete_artist(artist_id: str):
    deleted = service.delete_artist(artist_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Artist not found")
    return {"message": "Artist deleted successfully"}
