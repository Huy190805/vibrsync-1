from database.db import songs_collection, artists_collection
from database.repositories.song_repository import SongRepository
from database.repositories.album_repository import AlbumRepository
from models.song import SongInDB, SongCreate, SongUpdate
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Tuple
from urllib.request import urlopen
from urllib.error import HTTPError

class ArtistSongService:
    def __init__(self):
        self.repo = SongRepository()
        self.album_repo = AlbumRepository()

    @staticmethod
    def _map_to_song_in_db(song: dict) -> SongInDB:
        try:
            if not song.get("_id"):
                raise ValueError("Song document missing '_id' field")
            if not song.get("created_at"):
                song["created_at"] = datetime.utcnow()
            song["releaseYear"] = int(song.get("releaseYear", 0))
            song["duration"] = int(song.get("duration", 0))
            return SongInDB(
                id=str(song["_id"]),
                title=song.get("title", ""),
                artist=song.get("artist", ""),
                albumId=song.get("albumId", ""),
                releaseYear=song["releaseYear"],
                duration=song["duration"],
                genre=song.get("genre", []),
                coverArt=song.get("coverArt", None),
                audioUrl=song.get("audioUrl", None),
                artistId=str(song.get("artistId", "")),
                contributingArtistIds=[str(id) for id in song.get("contributingArtistIds", [])],
                lyrics_lrc=song.get("lyrics_lrc", ""),
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

    def get_artist_songs(self, artist_id: str, search: Optional[str] = None, sort: Optional[str] = None, skip: Optional[int] = 0, limit: Optional[int] = 10) -> Tuple[List[SongInDB], int]:
        try:
            query = {"artistId": str(artist_id)}
            if search:
                query["$or"] = [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"genre": {"$regex": search, "$options": "i"}}
                ]
            print(f"Querying songs for artist {artist_id} with query={query}, sort={sort}, skip={skip}, limit={limit}")
            songs = self.repo.find_all(sort, limit, skip, query)
            total = songs_collection.count_documents(query) if search else songs_collection.count_documents({"artistId": str(artist_id)})
            return [self._map_to_song_in_db(song) for song in songs], total
        except Exception as e:
            raise ValueError(f"Failed to fetch songs: {str(e)}")

    def get_song_by_id(self, song_id: str, artist_id: str) -> Optional[SongInDB]:
        try:
            song = self.repo.find_by_id(song_id)
            if not song or str(song.get("artistId")) != str(artist_id):
                print(f"Song not found or permission denied: {song_id} for artist {artist_id}")
                return None
            return self._map_to_song_in_db(song)
        except Exception as e:
            raise ValueError(f"Failed to fetch song: {str(e)}")

    def create_song(self, artist_id: str, song_data: SongCreate) -> str:
        try:
            song_dict = song_data.dict(exclude_unset=True)

            if "coverArt" in song_dict and song_dict["coverArt"]:
                song_dict["coverArt"] = str(song_dict["coverArt"])
            if "audioUrl" in song_dict and song_dict["audioUrl"]:
                song_dict["audioUrl"] = str(song_dict["audioUrl"])

            song_dict["artistId"] = str(artist_id)
            song_dict["created_at"] = datetime.utcnow()
            song_dict["updated_at"] = datetime.utcnow()

            # Validate artist
            artist_doc = artists_collection.find_one({"_id": ObjectId(artist_id)})
            if not artist_doc:
                raise ValueError(f"Artist with ID {artist_id} does not exist")
            song_dict["artist"] = artist_doc.get("name", "")

            # Validate URLs
            if song_dict.get("coverArt") and not self._is_url_accessible(song_dict["coverArt"]):
                raise ValueError("Invalid or inaccessible cover art URL")
            if song_dict.get("audioUrl") and not self._is_url_accessible(song_dict["audioUrl"]):
                raise ValueError("Invalid or inaccessible audio URL")

            # Validate and link album
            if song_dict.get("albumId"):
                album = self.album_repo.find_by_id(song_dict["albumId"])
                if not album or str(album.get("artist_id")) != str(artist_id):
                    raise ValueError(f"Album with ID {song_dict['albumId']} not found or not owned by artist")
                song_dict["album"] = album.get("title", "")

            song_id = self.repo.insert(song_dict)

            # Update album.songs
            if song_dict.get("albumId"):
                self.album_repo.add_song_to_album(song_dict["albumId"], str(song_id))

            print(f"Created song with ID: {song_id} for artist {artist_id}")
            return str(song_id)
        except Exception as e:
            print(f"Error creating song: {str(e)}")
            raise ValueError(f"Failed to create song: {str(e)}")

    def update_song(self, song_id: str, song_data: SongUpdate, artist_id: str) -> bool:
        try:
            song = self.repo.find_by_id(song_id)
            print(f"Found song {song_id}: {song}")
            if not song or str(song.get("artistId")) != str(artist_id):
                print(f"Song not found or permission denied: {song_id} for artist {artist_id}")
                return False

            update_data = song_data.dict(exclude_unset=True)
            print(f"Update data before conversion: {update_data}")
            update_data["updated_at"] = datetime.utcnow()

            # Convert HttpUrl to str
            if "coverArt" in update_data and update_data["coverArt"]:
                update_data["coverArt"] = str(update_data["coverArt"])
                if not self._is_url_accessible(update_data["coverArt"]):
                    raise ValueError("Invalid or inaccessible cover art URL")
            if "audioUrl" in update_data and update_data["audioUrl"]:
                update_data["audioUrl"] = str(update_data["audioUrl"])
                if not self._is_url_accessible(update_data["audioUrl"]):
                    raise ValueError("Invalid or inaccessible audio URL")

            # Handle album update
            if "albumId" in update_data:
                print(f"Updating album for song {song_id}, new albumId: {update_data['albumId']}")
                if update_data["albumId"]:
                    album = self.album_repo.find_by_id(update_data["albumId"])
                    if not album or str(album.get("artist_id")) != str(artist_id):
                        raise ValueError(f"Album with ID {update_data['albumId']} not found or not owned by artist")
                    update_data["album"] = album.get("title", "")
                else:
                    update_data["album"] = ""

                # Remove from old album
                if song.get("albumId"):
                    print(f"Removing song {song_id} from old album {song['albumId']}")
                    self.album_repo.remove_song_from_album(song["albumId"], song_id)
                # Add to new album
                if update_data.get("albumId"):
                    print(f"Adding song {song_id} to new album {update_data['albumId']}")
                    self.album_repo.add_song_to_album(update_data["albumId"], song_id)

            print(f"Update data after conversion: {update_data}")
            result = self.repo.update(song_id, update_data)
            print(f"Updated song {song_id}: {result}")
            return result
        except Exception as e:
            print(f"Error updating song {song_id}: {str(e)}")
            raise ValueError(f"Failed to update song: {str(e)}")

    def delete_song(self, song_id: str, artist_id: str) -> bool:
        try:
            song = self.repo.find_by_id(song_id)
            if not song or str(song.get("artistId")) != str(artist_id):
                print(f"Song not found or permission denied: {song_id} for artist {artist_id}")
                return False

            # Remove from album
            if song.get("albumId"):
                self.album_repo.remove_song_from_album(song["albumId"], song_id)
                print(f"Removed song {song_id} from album {song['albumId']}")

            result = self.repo.delete(song_id)
            print(f"Deleted song {song_id}: {result}")
            return result
        except Exception as e:
            print(f"Error deleting song {song_id}: {str(e)}")
            raise ValueError(f"Failed to delete song: {str(e)}")

    def get_songs_by_album(self, album_id: str, artist_id: str) -> List[SongInDB]:
        try:
            album = self.album_repo.find_by_id(album_id)
            if not album or str(album.get("artist_id")) != str(artist_id):
                print(f"Album not found or permission denied: {album_id} for artist {artist_id}")
                return []

            song_ids = album.get("songs", [])
            if not song_ids:
                return []

            query = {"_id": {"$in": [ObjectId(sid) for sid in song_ids]}}
            songs = self.repo.find_all(query=query)
            return [self._map_to_song_in_db(song) for song in songs]
        except Exception as e:
            raise ValueError(f"Failed to fetch songs: {str(e)}")