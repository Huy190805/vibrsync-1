from fastapi import APIRouter, Depends, HTTPException
from services.master_artist_service.artist_profile_service import ArtistProfileService
from auth import get_current_artist, get_current_user
from models.artist import ArtistUpdate
from fastapi import Body

router = APIRouter()
artist_service = ArtistProfileService()

@router.get("/artist/profile")
def get_profile(current_user=Depends(get_current_user)):
    if current_user["role"] != "artist":
        raise HTTPException(status_code=403, detail="Access denied")

    artist_id = current_user.get("artist_id")
    if not artist_id:
        raise HTTPException(status_code=400, detail="Missing artist_id")

    return artist_service.get_artist_profile(artist_id)

@router.put("/artist/profile")
def update_profile(
    update_data: ArtistUpdate = Body(...),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "artist":
        raise HTTPException(status_code=403, detail="Access denied")
    artist_id = current_user.get("artist_id")
    if not artist_id:
        raise HTTPException(status_code=400, detail="Missing artist_id")

    return artist_service.update_artist_profile(artist_id, update_data)