from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from models.artist import ArtistCreate, ArtistUpdate, ArtistInDB, SongData, AlbumData
from database.repositories.artist_repository import ArtistRepository
from database.repositories.song_repository import SongRepository
from database.repositories.album_repository import AlbumRepository

class ArtistService:
    def __init__(self):
        self.artist_repo = ArtistRepository()
        self.song_repo = SongRepository()
        self.album_repo = AlbumRepository()

    def _build_artist_in_db(self, artist: dict, include_songs_albums: bool = False, artist_id: Optional[ObjectId] = None) -> ArtistInDB:
        if include_songs_albums and artist_id:
            songs = self.song_repo.find_by_artist_id(artist_id)
            song_data = [
                SongData(
                    id=str(song["_id"]),
                    title=song.get("title", ""),
                    album=song.get("album", None),
                    releaseYear=song.get("releaseYear", 0),
                    coverArt=song.get("coverArt", None),
                    audioUrl=song.get("audioUrl", None),
                    genre=song.get("genre", [])[0] if isinstance(song.get("genre", []), list) and song.get("genre", []) else ""
                )
                for song in songs
            ]
            albums = self.album_repo.find_by_artist_id(artist_id)
            album_data = [
                AlbumData(
                    id=str(album["_id"]),
                    title=album.get("title", ""),
                    releaseYear=album.get("releaseYear", 0),
                    coverArt=album.get("coverArt", None)
                )
                for album in albums
            ]
        else:
            song_data = []
            album_data = []

        return ArtistInDB(
            id=str(artist["_id"]),
            name=artist.get("name", ""),
            bio=artist.get("bio", None),
            image=artist.get("image", None),
            genres=artist.get("genres", []),
            followers=artist.get("followers", 0),
            songs=song_data,
            albums=album_data,
            created_at=artist.get("created_at", datetime.utcnow()),
            updated_at=artist.get("updated_at", None)
        )

    def get_all_artists(self, skip: int = 0, limit: Optional[int] = None, include_songs_albums: bool = False) -> List[ArtistInDB]:
        try:
            artists = self.artist_repo.find_all(skip=skip, limit=limit)
            return [
                self._build_artist_in_db(artist, include_songs_albums, artist["_id"])
                for artist in artists
            ]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể lấy danh sách nghệ sĩ: {str(e)}")

    def get_artist_by_id(self, artist_id: str) -> Optional[ArtistInDB]:
        try:
            artist = self.artist_repo.find_by_id(ObjectId(artist_id))
            if not artist:
                return None
            return self._build_artist_in_db(artist, include_songs_albums=True, artist_id=ObjectId(artist_id))
        except InvalidId:
            raise HTTPException(status_code=400, detail="ID nghệ sĩ không hợp lệ")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể lấy thông tin nghệ sĩ: {str(e)}")

    def follow_artist(self, artist_id: str, user_id: str) -> bool:
        try:
            artist = self.artist_repo.find_by_id(ObjectId(artist_id))
            if not artist:
                raise HTTPException(status_code=404, detail="Artist not found")

            if user_id in artist.get("follower_ids", []):
                raise HTTPException(status_code=400, detail="Already following")

            update_data = {
                "$addToSet": {"follower_ids": user_id},
                "$inc": {"followers": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
            self.artist_repo.update_fields(ObjectId(artist_id), update_data)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to follow artist: {str(e)}")

    def unfollow_artist(self, artist_id: str, user_id: str) -> bool:
        try:
            artist = self.artist_repo.find_by_id(ObjectId(artist_id))
            if not artist:
                raise HTTPException(status_code=404, detail="Artist not found")

            if user_id not in artist.get("follower_ids", []):
                raise HTTPException(status_code=400, detail="Not following")

            update_data = {
                "$pull": {"follower_ids": user_id},
                "$inc": {"followers": -1},
                "$set": {"updated_at": datetime.utcnow()}
            }
            self.artist_repo.update_fields(ObjectId(artist_id), update_data)
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to unfollow artist: {str(e)}")