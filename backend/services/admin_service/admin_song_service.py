from database.db import artists_collection, songs_collection
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Tuple
from models.song import SongCreate, SongUpdate, SongInDB
from database.repositories.song_repository import SongRepository
from urllib.request import urlopen
from urllib.error import HTTPError

class AdminSongService:
    def __init__(self, song_repository: SongRepository):
        self.song_repository = song_repository

    @staticmethod
    def _map_to_song_in_db(song: dict) -> SongInDB:
        try:
            if not song.get("_id"):
                raise ValueError("Song document missing '_id' field")
            if not song.get("created_at"):
                song["created_at"] = datetime.utcnow()  # Fallback if missing
            # Convert releaseYear and duration to int if they are strings
            song["releaseYear"] = int(song.get("releaseYear", 0))
            song["duration"] = int(song.get("duration", 0))
            return SongInDB(
                id=str(song["_id"]),
                title=song.get("title", ""),
                artist=song.get("artist", ""),
                album=song.get("album") or "",
                releaseYear=song["releaseYear"],
                duration=song["duration"],
                genre=song.get("genre", ""),
                coverArt=song.get("coverArt", None),
                audioUrl=song.get("audioUrl", None),
                artistId=str(song.get("artistId", "")),
                lyrics_lrc=song.get("lyrics_lrc"),
                created_at=song["created_at"]
            )
        except Exception as e:
            print(f"Error mapping song to SongInDB: {str(e)}, song_data={song}")
            raise ValueError(f"Failed to map song data: {str(e)}")

    @staticmethod
    def _is_url_accessible(url: str) -> bool:
        if not url:
            return True
        try:
            with urlopen(url, timeout=5) as response:
                return response.status == 200
        except HTTPError as e:
            print(f"URL inaccessible: {url}, error: {str(e)}")
            return False

    def get_all_songs(self, search: Optional[str], sort: Optional[str], skip: Optional[int], limit: Optional[int]) -> Tuple[List[SongInDB], int]:
        try:
            query = {}
            if search:
                query["$or"] = [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"artist": {"$regex": search, "$options": "i"}},
                    {"genre": {"$regex": search, "$options": "i"}}
                ]
            songs = self.song_repository.find_all(sort, limit, skip, query)
            total = songs_collection.count_documents(query) if search else songs_collection.count_documents({})
            return [self._map_to_song_in_db(song) for song in songs], total
        except Exception as e:

            raise ValueError(f"Failed to fetch songs: {str(e)}")

    def get_song_by_id(self, song_id: str) -> Optional[SongInDB]:
        try:
            song = self.song_repository.find_by_id(song_id)
            if not song:
                print(f"Song not found: {song_id}")
                return None
            return self._map_to_song_in_db(song)
        except Exception as e:

            raise ValueError(f"Failed to fetch song: {str(e)}")

    def create_song(self, song_data: SongCreate) -> str:
        try:
            audioUrl = str(song_data.audioUrl) if song_data.audioUrl else None
            coverArt = str(song_data.coverArt) if song_data.coverArt else None

            # ✅ Validate and get artist name
            artist_doc = artists_collection.find_one({"_id": ObjectId(song_data.artistId)})
            if not artist_doc:
                raise ValueError(f"Artist with ID {song_data.artistId} does not exist")
            artist_name = artist_doc.get("name", "")

            if audioUrl and not self._is_url_accessible(audioUrl):
                raise ValueError("Invalid or inaccessible audio URL")
            if coverArt and not self._is_url_accessible(coverArt):
                raise ValueError("Invalid or inaccessible cover art URL")

            new_song = song_data.dict(exclude_unset=True)
            new_song["created_at"] = datetime.utcnow()
            new_song["artist"] = artist_name  # ✅ Add artist name

            if new_song.get("coverArt"):
                new_song["coverArt"] = str(new_song["coverArt"])
            if new_song.get("audioUrl"):
                new_song["audioUrl"] = str(new_song["audioUrl"])

            song_id = self.song_repository.insert(new_song)

            if song_data.album:
                from database.repositories.album_repository import AlbumRepository
                album_repo = AlbumRepository()
                album_doc = album_repo.find_by_title(song_data.album)
                if not album_doc:
                    raise ValueError(f"Album with title {song_data.album} not found")
                album_id = album_doc[0]["_id"]
                AlbumRepository.add_song_to_album(str(album_id), str(song_id))

            print(f"Created song with ID: {song_id}")
            return str(song_id)
        except Exception as e:
            print(f"Error creating song: {str(e)}")
            raise ValueError(f"Failed to create song: {str(e)}")

    def update_song(self, song_id: str, song_data: SongUpdate) -> bool:
        try:
            update_data = song_data.dict(exclude_unset=True)

            # ✅ Validate and set artist name if artistId is updated
            if "artistId" in update_data:
                artist_doc = artists_collection.find_one({"_id": ObjectId(update_data["artistId"])})
                if not artist_doc:
                    raise ValueError(f"Artist with ID {update_data['artistId']} does not exist")
                update_data["artist"] = artist_doc.get("name", "")  # ✅ Update artist name

            if "coverArt" in update_data and update_data["coverArt"]:
                if not self._is_url_accessible(str(update_data["coverArt"])):
                    raise ValueError("Invalid or inaccessible cover art URL")
                update_data["coverArt"] = str(update_data["coverArt"])

            if "audioUrl" in update_data and update_data["audioUrl"]:
                if not self._is_url_accessible(str(update_data["audioUrl"])):
                    raise ValueError("Invalid or inaccessible audio URL")
                update_data["audioUrl"] = str(update_data["audioUrl"])

            update_data["updated_at"] = datetime.utcnow()
            result = self.song_repository.update(song_id, update_data)

            if "album" in update_data:
                from database.repositories.album_repository import AlbumRepository
                album_repo = AlbumRepository()

                old_song = self.song_repository.find_by_id(song_id)
                if old_song and old_song.get("album"):
                    old_album_doc = album_repo.find_by_title(old_song["album"])
                    if old_album_doc:
                        old_album_id = old_album_doc[0]["_id"]
                        AlbumRepository.remove_song_from_album(str(old_album_id), song_id)

                new_album_doc = album_repo.find_by_title(update_data["album"])
                if not new_album_doc:
                    raise ValueError(f"Album with title {update_data['album']} not found")
                new_album_id = new_album_doc[0]["_id"]
                AlbumRepository.add_song_to_album(str(new_album_id), song_id)

            print(f"Updated song {song_id}: {result}")
            return result

        except Exception as e:
            print(f"Error updating song {song_id}: {str(e)}")
            raise ValueError(f"Failed to update song: {str(e)}")


    def delete_song(self, song_id: str) -> bool:
        try:
            # trước tiên tìm bài hát
            song = self.song_repository.find_by_id(song_id)
            if not song:
                raise ValueError(f"Song with ID {song_id} does not exist")

            # nếu có album -> xóa liên kết trong album
            if song.get("album"):
                from database.repositories.album_repository import AlbumRepository
                album_repo = AlbumRepository()
                album_doc = album_repo.find_by_title(song["album"])
                if album_doc:
                    album_id = album_doc[0]["_id"]
                    AlbumRepository.remove_song_from_album(str(album_id), song_id)
                    print(f"Removed song {song_id} from album {song['album']}")

            # xóa trong songs_collection
            result = self.song_repository.delete(song_id)
            print(f"Deleted song {song_id}: {result}")
            return result

        except Exception as e:
            print(f"Error deleting song {song_id}: {str(e)}")
            raise ValueError(f"Failed to delete song: {str(e)}")
