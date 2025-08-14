#playlist_routes
from fastapi import APIRouter, HTTPException
from database.db import playlists_collection
from bson import ObjectId, errors
from datetime import datetime
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from database.db import songs_collection
from bson.errors import InvalidId

from models.playlist import PlaylistCreate
from services.playlist_service import PlaylistService
from models.playlist import PlaylistUpdate
from fastapi import Depends
from bson import ObjectId

router = APIRouter()
playlist_service = PlaylistService()

from typing import Optional

@router.get("/playlists")
async def get_playlists(creator: Optional[str] = None):
    query = {"creator": creator} if creator else {}
    playlists = list(playlists_collection.find(query))
    for playlist in playlists:
        playlist["id"] = str(playlist["_id"])
        del playlist["_id"]
    return playlists


@router.get("/playlists/{id}")
async def get_playlist(id: str):
    try:
        # Nếu không phải ObjectId → fallback slug
        try:
            _id = ObjectId(id)
            playlist = playlists_collection.find_one({"_id": _id})
        except errors.InvalidId:
            playlist = playlists_collection.find_one({"slug": id})

        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")

        playlist["id"] = str(playlist["_id"])
        del playlist["_id"]
        return playlist

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid playlist ID: {str(e)}")

@router.post("/playlists")
async def create_playlist(data: PlaylistCreate):
    try:
        playlist_id = playlist_service.create_playlist(data)
        return {"id": playlist_id, "message": "Playlist created successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create playlist: {str(e)}")
    

class AddSongRequest(BaseModel):
    songId: str

@router.patch("/playlists/{playlist_id}/add-song")
async def add_song_to_playlist(playlist_id: str, data: dict):
    song_id = data.get("songId")
    if not song_id:
        raise HTTPException(status_code=400, detail="Song ID is required")

    result = playlists_collection.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$addToSet": {"songIds": song_id}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Playlist not found or song already added")

    return {"message": "Song added to playlist"}


class SongIdRequest(BaseModel):
    songId: str

@router.delete("/{playlist_id}/remove-song")
async def remove_song_from_playlist(playlist_id: str, data: SongIdRequest):
    try:
        success = playlist_service.remove_song_from_playlist(playlist_id, data.songId)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to remove song")
        return {"message": "Song removed from playlist successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing song: {str(e)}")


@router.patch("/playlists/{playlist_id}")
async def update_playlist(playlist_id: str, update_data: PlaylistUpdate):
    try:
        _id = ObjectId(playlist_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid playlist ID format")

    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = playlists_collection.update_one(
        {"_id": _id},
        {"$set": update_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Playlist not found")

    updated_playlist = playlists_collection.find_one({"_id": _id})
    updated_playlist["id"] = str(updated_playlist["_id"])
    del updated_playlist["_id"]
    return updated_playlist




@router.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str):
    try:
        result = playlists_collection.delete_one({"_id": ObjectId(playlist_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Playlist not found")

        return {"message": "Playlist deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting playlist: {str(e)}")


from models.playlist import PlaylistOut  # Add this import at the top

@router.delete("/playlists/{playlist_id}/songs/{song_id}", response_model=PlaylistOut)
async def remove_song_from_playlist(playlist_id: str, song_id: str):
    playlist = playlists_collection.find_one({"_id": ObjectId(playlist_id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    updated = playlists_collection.find_one_and_update(
        {"_id": ObjectId(playlist_id)},
        {"$pull": {"songIds": song_id}},
        return_document=True
    )

    if updated:
        updated["id"] = str(updated["_id"])
        del updated["_id"]

        # Đảm bảo có các field bắt buộc
        if "isShuffle" not in updated:
            updated["isShuffle"] = False
        if "songs" not in updated:
            updated["songs"] = []

        # Đảm bảo encode ObjectId -> str
        return jsonable_encoder(updated)

    raise HTTPException(status_code=500, detail="Failed to update playlist")

@router.patch("/playlists/{playlist_id}/cover")
async def update_playlist_cover(playlist_id: str, payload: dict):
    cover_art = payload.get("coverArt")
    if not cover_art:
        raise HTTPException(status_code=400, detail="coverArt is required")

    result = playlists_collection.update_one(
        {"_id": ObjectId(playlist_id)},
        {"$set": {"coverArt": cover_art}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Playlist not found or cover unchanged")

    return {"message": "Playlist cover updated", "coverArt": cover_art}

@router.get("/playlists/public")
async def get_public_playlists():
    try:
        playlists = list(playlists_collection.find({"isPublic": True}))
        for playlist in playlists:
            playlist["id"] = str(playlist["_id"])
            del playlist["_id"]

            # Đảm bảo luôn có field creator
            if "creator" not in playlist or not playlist["creator"]:
                playlist["creator"] = "Unknown User"

            # Đảm bảo có coverArt
            if "coverArt" not in playlist:
                playlist["coverArt"] = "https://via.placeholder.com/640x640.png?text=Playlist+Cover"

        return playlists
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch public playlists: {str(e)}")

@router.get("/playlists/{playlist_id}/songs", response_model=dict)
async def get_songs_in_playlist(playlist_id: str):
    playlist = playlists_collection.find_one({"_id": ObjectId(playlist_id)})
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    song_ids = playlist.get("songIds", [])
    if not song_ids:
        return {"songs": []}

    # convert string IDs to ObjectId
    object_ids = [ObjectId(song_id) for song_id in song_ids]
    songs = list(songs_collection.find({"_id": {"$in": object_ids}}))

    # clean up ObjectId
    for song in songs:
        song["id"] = str(song["_id"])
        del song["_id"]

    return {"songs": songs}