from database.db import albums_collection
from bson import ObjectId
from bson.errors import InvalidId
from typing import List, Optional, Dict
from datetime import datetime

class AlbumRepository:
    def __init__(self, collection=albums_collection):  # ✅ dùng default param
        self.collection = collection
        
    @staticmethod
    def _validate_object_id(album_id: str) -> ObjectId:
        try:
            return ObjectId(album_id)
        except InvalidId:
            raise ValueError(f"Invalid ObjectId: {album_id}")

    @staticmethod
    def find_all(limit: Optional[int] = None, skip: int = 0) -> List[Dict]:
        try:
            cursor = albums_collection.find().skip(skip)
            if limit:
                cursor = cursor.limit(limit)
            return list(cursor)
        except Exception as e:
            raise ValueError(f"Failed to query albums: {str(e)}")

    @staticmethod
    def find_by_id(album_id: str) -> Optional[Dict]:
        try:
            return albums_collection.find_one({"_id": AlbumRepository._validate_object_id(album_id)})
        except Exception as e:
            raise ValueError(f"Failed to find album by id: {str(e)}")

    def find_by_title(self, title: str) -> List[Dict]:
        try:
            title = title.strip()
            return list(self.collection.find({"title": {"$regex": f"^{title}$", "$options": "i"}}))
        except Exception as e:
            raise ValueError(f"Failed to query albums by title: {str(e)}")

    @staticmethod
    def find_by_artist_id(artist_id: ObjectId) -> List[Dict]:
        try:
            albums = albums_collection.find({"artist_id": str(artist_id)})
            return list(albums)
        except Exception as e:
            raise ValueError(f"Failed to query albums by artist_id: {str(e)}")

    @staticmethod
    def insert(album_data: Dict) -> str:
        try:
            result = albums_collection.insert_one(album_data)
            return str(result.inserted_id)
        except Exception as e:
            raise ValueError(f"Failed to insert album: {str(e)}")

    @staticmethod
    def update(album_id: str, update_data: Dict) -> bool:
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = albums_collection.update_one(
                {"_id": AlbumRepository._validate_object_id(album_id)},
                {"$set": update_data}
            )
            return result.matched_count > 0
        except Exception as e:
            raise ValueError(f"Failed to update album: {str(e)}")

    @staticmethod
    def delete(album_id: str) -> bool:
        try:
            result = albums_collection.delete_one({"_id": AlbumRepository._validate_object_id(album_id)})
            return result.deleted_count > 0
        except Exception as e:
            raise ValueError(f"Failed to delete album: {str(e)}")

    @staticmethod
    def delete_by_artist_id(artist_id: ObjectId) -> bool:
        try:
            result = albums_collection.delete_many({"artist_id": str(artist_id)})
            return result.deleted_count > 0
        except Exception as e:
            raise ValueError(f"Failed to delete albums by artist_id: {str(e)}")

    @staticmethod
    def add_song_to_album(album_id: str, song_id: str) -> bool:
        try:
            result = albums_collection.update_one(
                {"_id": AlbumRepository._validate_object_id(album_id)},
                {"$addToSet": {"songs": song_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            raise ValueError(f"Failed to add song to album: {str(e)}")
        
    @staticmethod
    def remove_song_from_album(album_id: str, song_id: str) -> bool:
        try:
            result = albums_collection.update_one(
                {"_id": AlbumRepository._validate_object_id(album_id)},
                {"$pull": {"songs": song_id}}
            )
            return result.modified_count > 0
        except Exception as e:
            raise ValueError(f"Failed to remove song from album: {str(e)}")
        
    @staticmethod
    def get_all_album_simple() -> List[Dict]:
        """
        Lấy tất cả album và chỉ lấy các trường cần thiết.
        """
        try:
            albums = albums_collection.find({}, {
                "_id": 1,
                "title": 1,
                "artist_id": 1,
                "release_year": 1,
                "genres": 1,
                "songs": 1,
                "cover_image": 1,
                "release_date": 1,
                "created_at": 1,
                "updated_at": 1
            })
            return list(albums)
        except Exception as e:
            raise ValueError(f"Failed to get all albums: {str(e)}")

