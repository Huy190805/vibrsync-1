from database.db import playlists_collection
from bson import ObjectId
from bson.errors import InvalidId
from typing import List, Optional, Dict

class PlaylistRepository:
    @staticmethod
    def _validate_object_id(playlist_id: str) -> ObjectId:
        try:
            return ObjectId(playlist_id)
        except InvalidId:
            raise ValueError(f"Invalid ObjectId: {playlist_id}")

    @staticmethod
    def find_all() -> List[Dict]:
        try:
            cursor = playlists_collection.find()
            playlists = list(cursor)
            for playlist in playlists:
                playlist["id"] = str(playlist["_id"])
                del playlist["_id"]
            return playlists
        except Exception as e:
            raise ValueError(f"Failed to query playlists: {str(e)}")

    @staticmethod
    def find_by_id(playlist_id: str) -> Optional[Dict]:
        try:
            playlist = playlists_collection.find_one({"_id": PlaylistRepository._validate_object_id(playlist_id)})
            if playlist:
                playlist["id"] = str(playlist["_id"])
                del playlist["_id"]
            return playlist
        except Exception as e:
            raise ValueError(f"Failed to query playlist by ID: {str(e)}")

    @staticmethod
    def insert(playlist_data: Dict) -> str:
        result = playlists_collection.insert_one(playlist_data)
        return str(result.inserted_id)

    @staticmethod
    def update(playlist_id: str, update_data: Dict) -> bool:
        from datetime import datetime
        update_data["updated_at"] = datetime.utcnow()
        result = playlists_collection.update_one(
            {"_id": PlaylistRepository._validate_object_id(playlist_id)},
            {"$set": update_data}
        )
        return result.matched_count > 0

    @staticmethod
    def delete(playlist_id: str) -> bool:
        result = playlists_collection.delete_one({"_id": PlaylistRepository._validate_object_id(playlist_id)})
        return result.deleted_count > 0