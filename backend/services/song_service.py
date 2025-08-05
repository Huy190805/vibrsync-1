from database.db import artists_collection
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Dict
from models.song import SongCreate, SongUpdate, SongInDB
from database.repositories.song_repository import SongRepository
from database.repositories.artist_repository import ArtistRepository
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
from random import shuffle
from fastapi import HTTPException
from database.db import albums_collection
from database.repositories.album_repository import AlbumRepository
from utils.text_utils import normalize_text
import difflib

class SongService:
    def __init__(self, song_repository: SongRepository, artist_repository: ArtistRepository):
        self.song_repository = song_repository
        self.artist_repository = artist_repository
        self.album_repo = AlbumRepository(albums_collection)

    # ----------------------------
    # Fuzzy Search
    # ----------------------------
    def find_song_by_fuzzy_title(self, query: str):
        songs = self.song_repository.get_all_songs_simple()
        query_norm = normalize_text(query)
        titles = [normalize_text(song["title"]) for song in songs]
        matches = difflib.get_close_matches(query_norm, titles, n=1, cutoff=0.6)
        if matches:
            matched_title = matches[0]
            for song in songs:
                if normalize_text(song["title"]) == matched_title:
                    return song
        return None

    # ----------------------------
    # Utility Methods
    # ----------------------------
    def _map_to_song_in_db(self, song: dict) -> SongInDB:
        # Lấy tên nghệ sĩ từ artistId
        artist_name = ""
        artist_id = song.get("artistId")
        if artist_id:
            try:
                obj_id = ObjectId(artist_id)
                artist = self.artist_repository.find_by_id(obj_id)
                if artist:
                    artist_name = artist.get("name", "")
            except Exception:
                artist_name = ""
        
        return SongInDB(
            id=str(song.get("_id", "")),
            title=song.get("title", ""),
            artist=artist_name,
            album=song.get("album", ""),
            releaseYear=song.get("releaseYear", 0),
            duration=song.get("duration", 0),
            genre=song.get("genre", []),
            coverArt=song.get("coverArt", ""),
            audioUrl=song.get("audioUrl", ""),
            lyrics_lrc=song.get("lyrics_lrc", None),
            artistId=str(artist_id) if artist_id else "",
            created_at=song.get("created_at", datetime.utcnow()),
            updated_at=song.get("updated_at", None)
        )

    @staticmethod
    def _is_url_accessible(url: str) -> bool:
        try:
            with urlopen(url, timeout=5) as response:
                return response.status == 200
        except (HTTPError, URLError):
            return False

    # ----------------------------
    # CRUD / Queries
    # ----------------------------
    def get_all_songs(
        self,
        sort: Optional[str] = None,
        limit: Optional[int] = None,
        skip: Optional[int] = 0,
        query: Optional[Dict] = None
    ) -> List[SongInDB]:
        songs = self.song_repository.find_all(sort, limit, skip, query)
        return [self._map_to_song_in_db(song) for song in songs]

    def get_song_by_id(self, song_id: str) -> Optional[SongInDB]:
        song = self.song_repository.find_by_id(song_id)
        if not song:
            return None
        return self._map_to_song_in_db(song)

    def create_song(self, song_data: SongCreate) -> str:
        # Kiểm tra artistId tồn tại
        if not self.artist_repository.find_by_id(ObjectId(song_data.artistId)):
            raise ValueError(f"Artist with ID {song_data.artistId} does not exist")

        # Kiểm tra URL media
        if song_data.audioUrl and not self._is_url_accessible(song_data.audioUrl):
            raise ValueError("Invalid or inaccessible audio URL")
        if song_data.coverArt and not self._is_url_accessible(song_data.coverArt):
            raise ValueError("Invalid or inaccessible cover art URL")

        new_song = song_data.dict(exclude_unset=True)
        new_song["artistId"] = str(new_song["artistId"])  # Đảm bảo artistId là chuỗi
        new_song["created_at"] = datetime.utcnow()
        new_song["updated_at"] = None
        return str(self.song_repository.insert(new_song))

    def update_song(self, song_id: str, song_data: SongUpdate) -> bool:
        update_data = song_data.dict(exclude_unset=True)
        if "artistId" in update_data:
            if not self.artist_repository.find_by_id(ObjectId(update_data["artistId"])):
                raise ValueError(f"Artist with ID {update_data['artistId']} does not exist")
            update_data["artistId"] = str(update_data["artistId"])  # Đảm bảo artistId là chuỗi
        if "audioUrl" in update_data and update_data["audioUrl"]:
            if not self._is_url_accessible(update_data["audioUrl"]):
                raise ValueError("Invalid or inaccessible audio URL")
        if "coverArt" in update_data and update_data["coverArt"]:
            if not self._is_url_accessible(update_data["coverArt"]):
                raise ValueError("Invalid or inaccessible cover art URL")
        update_data["updated_at"] = datetime.utcnow()
        return self.song_repository.update(song_id, update_data)

    def delete_song(self, song_id: str) -> bool:
        return self.song_repository.delete(song_id)

    # ----------------------------
    # Simple Songs
    # ----------------------------
    def get_all_songs_simple(self) -> List[Dict]:
        try:
            raw_songs = self.song_repository.get_all_songs_simple()
            return [
                {
                    "title": song.get("title", ""),
                    "song_id": str(song.get("_id", "")),
                    "artist": song.get("artist", ""),
                    "artistId": str(song.get("artistId", "")),
                    "releaseYear": song.get("releaseYear", ""),
                }
                for song in raw_songs
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi lấy bài hát: {str(e)}")

    # ----------------------------
    # Genre
    # ----------------------------
    def get_songs_by_genre(self, genre: str, page: int = 1, limit: Optional[int] = 50) -> List[SongInDB]:
        if not genre:
            raise ValueError("Genre is required")
        songs = self.song_repository.find_by_genre(genre, page, limit)
        return [self._map_to_song_in_db(song) for song in songs]

    # ----------------------------
    # Random & Region
    # ----------------------------
    def get_random_songs(self, limit: int = 10, region: Optional[str] = None) -> List[SongInDB]:
        """
        Lấy danh sách ngẫu nhiên. Nếu có region:
        - region == 'vietnamese' => chỉ lấy bài có genre chứa 'vietnamese'
        - region khác => chỉ lấy bài không chứa 'vietnamese' (giả định quốc tế)
        """
        # Lấy nhiều hơn để lọc rồi chọn top 'limit'
        raw_songs = self.song_repository.get_random_songs(limit=limit * 3)

        if region:
            is_vietnamese = region.lower() == "vietnamese"
            raw_songs = [
                s for s in raw_songs
                if any("vietnamese" in g.lower() for g in s.get("genre", [])) == is_vietnamese
            ]

        shuffle(raw_songs)
        return [self._map_to_song_in_db(song) for song in raw_songs[:limit]]

    def get_songs_by_region(
        self,
        region: str,
        limit: Optional[int] = 12,
        refresh: bool = False
    ) -> List[SongInDB]:
        raw_songs = self.song_repository.get_random_songs_by_region(region, limit=limit)
        return [self._map_to_song_in_db(song) for song in raw_songs]

    def get_random_songs_by_region(self, region: Optional[str], limit: int = 12) -> List[SongInDB]:
        raw_songs = self.song_repository.get_random_songs_by_region(region=region, limit=limit)
        return [self._map_to_song_in_db(song) for song in raw_songs]