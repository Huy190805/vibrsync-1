from fastapi import APIRouter, Depends, HTTPException
from services.like_service import LikeService
from auth import get_current_user
from database.db import db  # Add this import for your MongoDB connection
from datetime import datetime  # Add this import for timestamps
# ...existing code...

router = APIRouter(prefix="/likes", tags=["likes"])

like_service = LikeService()

@router.get("/is-liked/{song_id}")
async def is_liked(song_id: str, user: dict = Depends(get_current_user)):
    return {"isLiked": like_service.is_liked(user["id"], song_id)}

@router.post("/{song_id}/like")
async def like_song(song_id: str, user: dict = Depends(get_current_user)):
    if like_service.is_liked(user["id"], song_id):
        raise HTTPException(status_code=400, detail="Already liked")
    like_service.like(user["id"], song_id)
    return {"message": "Liked"}

@router.post("/{song_id}/unlike")
async def unlike_song(song_id: str, user: dict = Depends(get_current_user)):
    if not like_service.is_liked(user["id"], song_id):
        raise HTTPException(status_code=400, detail="Not liked")
    like_service.unlike(user["id"], song_id)
    return {"message": "Unliked"}


@router.get("/playlist/is-liked/{playlist_id}")
async def is_playlist_liked(playlist_id: str, user: dict = Depends(get_current_user)):
    like = db["liked_playlists"].find_one({
        "user_id": user["id"],
        "playlist_id": playlist_id
    })
    return {"isLiked": like is not None}


@router.post("/playlist/{playlist_id}/like")
async def like_playlist(playlist_id: str, user: dict = Depends(get_current_user)):
    if db["liked_playlists"].find_one({"user_id": user["id"], "playlist_id": playlist_id}):
        raise HTTPException(status_code=400, detail="Already liked")
    db["liked_playlists"].insert_one({
        "user_id": user["id"],
        "playlist_id": playlist_id,
        "liked_at": datetime.utcnow()
    })
    return {"message": "Playlist liked"}


@router.post("/playlist/{playlist_id}/unlike")
async def unlike_playlist(playlist_id: str, user: dict = Depends(get_current_user)):
    result = db["liked_playlists"].delete_one({
        "user_id": user["id"],
        "playlist_id": playlist_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not liked")
    return {"message": "Playlist unliked"}