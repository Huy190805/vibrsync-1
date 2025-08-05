from database.db import songs_collection, db
from bson import ObjectId
from bson.errors import InvalidId
from bson.regex import Regex
from typing import List, Optional, Dict
from datetime import datetime
import logging
import random
from services.genre_service import get_region_query

# 🔧 Cấu hình logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Đảm bảo hiển thị cả DEBUG
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(levelname)s] %(asctime)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

class SongRepository:
    PROJECTION = {
        "title": 1,
        "artistId": 1,
        "album": 1,
        "releaseYear": 1,
        "duration": 1,
        "genre": 1,
        "coverArt": 1,
        "audioUrl": 1,
        "lyrics_lrc": 1,
        "created_at": 1,
        "updated_at": 1
    }

    def __init__(self):
        self.collection = db["songs"]
        
    def find_by_title(self, title: str):
       return self.collection.find_one({"title": {"$regex": f"^{title}$", "$options": "i"}})

    @staticmethod
    def _validate_object_id(song_id: str) -> ObjectId:
        try:
            return ObjectId(song_id)
        except InvalidId:
            raise ValueError(f"Invalid ObjectId: {song_id}")

    @staticmethod
    def find_all(sort: Optional[str] = None, limit: Optional[int] = None, skip: Optional[int] = 0, query: Optional[Dict] = None) -> List[Dict]:
        try:
            cursor = songs_collection.find(query or {})
            if sort:
                cursor = cursor.sort(sort, 1)
            if skip is not None:
                cursor = cursor.skip(skip)
            if limit:
                cursor = cursor.limit(limit)
            songs = list(cursor)
            logger.info(f"Found {len(songs)} songs with query={query}, sort={sort}, skip={skip}, limit={limit}")
            return songs
        except Exception as e:
            logger.error(f"Error in find_all: {str(e)}")
            raise ValueError(f"Failed to query songs: {str(e)}")

    @staticmethod
    def find_by_id(song_id: str) -> Optional[Dict]:
        return songs_collection.find_one({"_id": SongRepository._validate_object_id(song_id)}, SongRepository.PROJECTION)

    @staticmethod
    def find_by_artist_id(artist_id: ObjectId) -> List[Dict]:
        try:
            # Thử tìm với cả chuỗi và ObjectId
            songs = songs_collection.find({
                "$or": [
                    {"artistId": str(artist_id)},
                    {"artistId": artist_id}
                ]
            })
            return list(songs)
        except Exception as e:
            logger.error(f"[find_by_artist_id] Error: {str(e)}")
            raise ValueError(f"Failed to query songs by artist_id: {str(e)}")

    @staticmethod
    def insert(song_data: Dict) -> str:
        result = songs_collection.insert_one(song_data)
        return str(result.inserted_id)

    @staticmethod
    def update(song_id: str, update_data: Dict) -> bool:
        update_data["updated_at"] = datetime.utcnow()
        result = songs_collection.update_one(
            {"_id": SongRepository._validate_object_id(song_id)},
            {"$set": update_data}
        )
        return result.matched_count > 0

    @staticmethod
    def delete(song_id: str) -> bool:
        result = songs_collection.delete_one({"_id": SongRepository._validate_object_id(song_id)})
        return result.deleted_count > 0

    @staticmethod
    def delete_by_artist_id(artist_id: ObjectId) -> bool:
        result = songs_collection.delete_many({
            "$or": [
                {"artistId": str(artist_id)},
                {"artistId": artist_id}
            ]
        })
        return result.deleted_count > 0
    
    @staticmethod
    def get_all_songs_simple() -> List[Dict]:
        try:
            songs = songs_collection.find({}, SongRepository.PROJECTION)
            return list(songs)
        except Exception as e:
            logger.error(f"[get_all_songs_simple] Error: {str(e)}")
            return []
    
    @staticmethod
    def find_by_album_id(album_id: str, artist_id: str) -> List[dict]:
        """Lấy bài hát theo album + artist (artistId có thể là string hoặc ObjectId)."""
        try:
            return list(songs_collection.find({
                "album": album_id,
                "$or": [
                    {"artistId": artist_id},
                    {"artistId": ObjectId(artist_id)}
                ]
            }, SongRepository.PROJECTION))
        except Exception as e:
            logger.error(f"[find_by_album_id] Error: {str(e)}")
            raise

    @staticmethod
    def search_by_title(keyword: str, limit: int = 20) -> List[Dict]:
        try:
            regex = Regex(keyword, "i")
            cursor = (
                songs_collection.find({"title": {"$regex": regex}})
                .sort("title", 1)
                .limit(limit)
            )
            results = list(cursor)
            logger.info(f"search_by_title -> {len(results)} hit(s) for '{keyword}'")
            return results
        except Exception as e:
            logger.error(f"Error in search_by_title: {e}")
            raise ValueError(f"Failed to search songs: {e}")

    @staticmethod
    def find_by_ids(song_ids: List[str]) -> List[Dict]:
        try:
            object_ids = [ObjectId(id) for id in song_ids]
            songs = songs_collection.find({"_id": {"$in": object_ids}})
            return list(songs)
        except Exception as e:
            logger.error(f"Error in find_by_ids: {e}")
            raise ValueError("Failed to find songs by IDs")
        
    @staticmethod
    def find_by_genre(genre: str, page: int = 1, limit: int = 500) -> List[Dict]:
        try:
            query = {
                "genre": {
                    "$elemMatch": {
                        "$regex": f"^{genre}$",
                        "$options": "i"
                    }
                }
            } if genre else {}

            skip = (page - 1) * limit

            logger.info(f"🔍 [find_by_genre] Query: {query}, skip={skip}, limit={limit}")

            cursor = songs_collection.find(query).skip(skip).limit(limit)
            songs = list(cursor)

            logger.info(f"✅ Found {len(songs)} songs for genre '{genre}' (page={page}, limit={limit})")

            for i, song in enumerate(songs):
                logger.debug(f"{i+1:02d}. 🎵 {song.get('title')} | Genre: {song.get('genre')}")

            return songs
        except Exception as e:
            logger.error(f"❌ Error in find_by_genre: {str(e)}")
            raise ValueError(f"Failed to query songs by genre: {str(e)}")

    @staticmethod
    def get_top_songs_by_genre_simple(genre: str, limit: int = 100) -> List[Dict]:
        try:
            query = {
                "genre": {
                    "$elemMatch": {
                        "$regex": f"^{genre}$",
                        "$options": "i"
                    }
                }
            }

            cursor = songs_collection.find(query).limit(limit)
            songs = list(cursor)

            # ✅ Convert ObjectId to string
            for song in songs:
                if "_id" in song:
                    song["_id"] = str(song["_id"])

            logger.info(f"✅ Found {len(songs)} songs for genre '{genre}'")
            return songs

        except Exception as e:
            logger.error(f"❌ Error in get_top_songs_by_genre_simple: {str(e)}")
            raise ValueError(f"Failed to get songs for genre '{genre}'")

    @staticmethod
    def find_by_genre(genre: str, page: int = 1, limit: int = None) -> List[Dict]:
        try:
           # Tách genre nếu có dạng "Genre1 and Genre2"
           genres = [g.strip() for g in genre.split(" and ")] if " and " in genre else [genre]
           query = {"genre": {"$all": genres}} if genres else {}
           print(f"Querying database with: {query}, page: {page}, limit: {limit}")
 
           # Xử lý phân trang chỉ khi limit được cung cấp
           if limit is not None:
              skip = (page - 1) * limit
              cursor = songs_collection.find(query).skip(skip).limit(limit)
           else:
              # Lấy toàn bộ nếu không có giới hạn
              cursor = songs_collection.find(query)

           songs = list(cursor)
           print(f"Found {len(songs)} songs for genre '{genre}'")
           return songs

        except Exception as e:
           print(f"Error in find_by_genre: {str(e)}")
           raise ValueError(f"Failed to query songs by genre: {str(e)}")
        
    # -----------------------
    # Genre & Region
    # -----------------------
    @staticmethod
    def get_random_songs(limit: int = 10) -> List[Dict]:
        try:
            pipeline = [
                {"$sample": {"size": limit}},
                {"$project": SongRepository.PROJECTION}
            ]
            return list(songs_collection.aggregate(pipeline))
        except Exception as e:
            logger.error(f"[get_random_songs] Error: {str(e)}")
            raise ValueError(f"Error in get_random_songs: {str(e)}")

    @staticmethod
    def get_random_songs_by_region(region: Optional[str], limit: int = 12) -> List[Dict]:
        try:
            match_stage = {"$match": get_region_query(region)} if region else {"$match": {}}
            pipeline = [
                match_stage,
                {"$sample": {"size": limit}},
                {"$project": SongRepository.PROJECTION}
            ]
            return list(songs_collection.aggregate(pipeline))
        except Exception as e:
            logger.error(f"[get_random_songs_by_region] Error: {str(e)}")
            raise ValueError(f"Error in get_random_songs_by_region: {str(e)}")

    @staticmethod
    def find_by_region(region: str, limit: Optional[int] = None, refresh: bool = False) -> List[Dict]:
        try:
            match = get_region_query(region)
            cursor = songs_collection.find(match, SongRepository.PROJECTION)

            if refresh:
                songs = list(cursor)
                random.shuffle(songs)
                return songs[:limit] if limit else songs

            cursor = cursor.sort("title", 1)
            if limit:
                cursor = cursor.limit(limit)
            return list(cursor)
        except Exception as e:
            logger.error(f"[find_by_region] Error: {str(e)}")
            raise ValueError(f"Failed to find songs by region: {str(e)}")
        
    # -----------------------
    # Other
    # -----------------------   
    @staticmethod
    def get_all_titles(self):
        return [song["title"].lower() for song in self.collection.find({}, {"title": 1})]
