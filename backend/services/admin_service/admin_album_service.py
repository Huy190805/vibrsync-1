from models.album import AlbumInDB, AlbumCreate, AlbumUpdate
from database.repositories.album_repository import AlbumRepository
from bson import ObjectId
from datetime import datetime
from typing import Optional, List
import re

class AdminAlbumService:
    def __init__(self, repo: AlbumRepository):
        self.repo = repo

    def get_all_albums(self) -> List[AlbumInDB]:
        albums = self.repo.find_all()
        return [
            AlbumInDB(
                id=str(album["_id"]),
                title=album.get("title", ""),  
                artist_id=str(album.get("artist_id", "")),  
                cover_art=album.get("cover_image") or album.get("cover_art") or None,  
                release_year=album.get("release_date", datetime.utcnow()).year if album.get("release_date") else album.get("release_year", datetime.utcnow().year),
                genres=album.get("genres", []),
                songs=album.get("songs", []),
                created_at=album.get("created_at", datetime.utcnow()),
                updated_at=album.get("updated_at", datetime.utcnow()),
            )
            for album in albums
        ]

    def get_album_by_id(self, album_id: str) -> Optional[AlbumInDB]:
        album = self.repo.find_by_id(album_id)
        if not album:
            return None
        return AlbumInDB(
            id=str(album["_id"]),
            title=album.get("title", ""),
            artist_id=str(album.get("artist_id", "")),
            cover_art=album.get("cover_image") or album.get("cover_art") or None,
            release_year=album.get("release_date", datetime.utcnow()).year if album.get("release_date") else album.get("release_year", datetime.utcnow().year),
            genres=album.get("genres", []),
            songs=album.get("songs", []),
            created_at=album.get("created_at", datetime.utcnow()),
            updated_at=album.get("updated_at", datetime.utcnow()),
        )

    def search_albums(self, name: str) -> List[AlbumInDB]:
        albums = self.repo.find_by_title(name)
        return [
            AlbumInDB(
                id=str(album["_id"]),
                title=album.get("title", ""),
                artist_id=str(album.get("artist_id", "")),
                cover_art=album.get("cover_image") or album.get("cover_art") or None,
                release_year=album.get("release_date", datetime.utcnow()).year if album.get("release_date") else album.get("release_year", datetime.utcnow().year),
                genres=album.get("genres", []),
                songs=album.get("songs", []),
                created_at=album.get("created_at", datetime.utcnow()),
                updated_at=album.get("updated_at", datetime.utcnow()),
            )
            for album in albums
        ]
    def create_album(self, data: AlbumCreate) -> str:
        # Chuẩn hóa title
        title = re.sub(r'\s+', ' ', data.title.strip())
        print(f"Creating album with title: '{title}'")

        # Tạo dữ liệu album
        album_dict = data.dict(exclude_unset=True)
        album_dict["title"] = title
        album_dict["cover_image"] = str(data.cover_art) if data.cover_art else None
        album_dict.pop("cover_art", None)
        album_dict["release_date"] = datetime(data.release_year, 1, 1)
        album_dict["genres"] = data.genres or []
        album_dict["songs"] = data.songs or []
        album_dict["created_at"] = datetime.utcnow()
        album_dict["updated_at"] = datetime.utcnow()

        # Lưu vào database
        try:
            new_album_id = self.repo.insert(album_dict)
            print(f"Inserted album with ID: {new_album_id}")
            return new_album_id
        except Exception as e:
            if "E11000" in str(e):
                raise ValueError(f"Album with title '{title}' already exists")
            raise ValueError(f"Failed to insert album: {str(e)}")

    def update_album(self, album_id: str, data: AlbumUpdate) -> bool:
        current_album = self.repo.find_by_id(album_id)
        if not current_album:
            raise ValueError(f"Album with id '{album_id}' not found")

        update_data = data.dict(exclude_unset=True)

    # validate artist_id nếu có
        if "artist_id" in update_data:
            from database.db import artists_collection
            if not artists_collection.find_one({"_id": ObjectId(update_data["artist_id"])}):
                raise ValueError(f"Artist with id {update_data['artist_id']} not found")
            print(f"[AlbumService] artist_id validated OK: {update_data['artist_id']}")

    # validate title trùng
        if "title" in update_data:
            new_title = update_data.pop("title").strip()
            if new_title != current_album.get("title"):
                existing = self.repo.find_by_title(new_title)
                existing = [al for al in existing if str(al["_id"]) != album_id]
                if existing:
                    raise ValueError(f"Album with title '{new_title}' already exists")
            update_data["title"] = new_title

    # cover_art
        if "cover_art" in update_data:
           update_data["cover_image"] = str(update_data.pop("cover_art")) if update_data["cover_art"] else None

    # release_year
        if "release_year" in update_data:
           update_data["release_date"] = datetime(update_data.pop("release_year"), 1, 1)

    # genres
        if "genres" in update_data:
           update_data["genres"] = update_data["genres"] or []

        update_data["updated_at"] = datetime.utcnow()

        print(f"[AlbumService] update_album final update_data: {update_data}")

        result = self.repo.update(album_id, update_data)
        if not result:
            raise ValueError(f"Failed to update album with id '{album_id}'")

        print(f"[AlbumService] album {album_id} updated successfully")
        return result


    def delete_album(self, album_id: str) -> bool:
        result = self.repo.delete(album_id)
        if not result:
            raise ValueError(f"Failed to delete album with id '{album_id}'")
        return result