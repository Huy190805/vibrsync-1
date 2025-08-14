#PlaylistService
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from models.playlist import PlaylistCreate, PlaylistUpdate, PlaylistInDB
from database.repositories.playlist_repository import PlaylistRepository

class PlaylistService:
    def __init__(self):
        self.playlist_repo = PlaylistRepository()

    def _build_playlist_in_db(self, playlist: dict) -> PlaylistInDB:
        return PlaylistInDB(
            id=str(playlist["_id"]),
            title=playlist.get("title", ""),
            description=playlist.get("description", "A new playlist"),
            creator=playlist.get("creator", "You"),
            songIds=playlist.get("songIds", []),
            coverArt=playlist.get("coverArt", "https://via.placeholder.com/640x640.png?text=Playlist+Cover"),
            created_at=playlist.get("created_at", datetime.utcnow()),
            updated_at=playlist.get("updated_at", None)
        )

    def get_all_playlists(self) -> List[PlaylistInDB]:
        try:
            playlists = self.playlist_repo.find_all()
            return [self._build_playlist_in_db(playlist) for playlist in playlists]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể lấy danh sách playlist: {str(e)}")

    def get_playlist_by_id(self, playlist_id: str) -> Optional[PlaylistInDB]:
        try:
            playlist = self.playlist_repo.find_by_id(playlist_id)
            if not playlist:
                return None
            return self._build_playlist_in_db(playlist)
        except InvalidId:
            raise HTTPException(status_code=400, detail="ID playlist không hợp lệ")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể lấy thông tin playlist: {str(e)}")

    def create_playlist(self, playlist_data: PlaylistCreate) -> str:
        try:
            new_playlist = playlist_data.dict(exclude_unset=True)
            new_playlist["created_at"] = datetime.utcnow()
            new_playlist["updated_at"] = datetime.utcnow()
            playlist_id = self.playlist_repo.insert(new_playlist)
            return playlist_id  # Đã là string rồi, không cần `.inserted_id`

        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể tạo playlist: {str(e)}")

    def update_playlist(self, playlist_id: str, playlist_data: PlaylistUpdate) -> bool:
        try:
            update_data = playlist_data.dict(exclude_unset=True)
            if not update_data:
                raise ValueError("Không có dữ liệu cập nhật được cung cấp")
            update_data["updated_at"] = datetime.utcnow()
            result = self.playlist_repo.update(playlist_id, update_data)
            return result
        except InvalidId:
            raise HTTPException(status_code=400, detail="ID playlist không hợp lệ")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể cập nhật playlist: {str(e)}")

    def delete_playlist(self, playlist_id: str) -> bool:
        try:
            result = self.playlist_repo.delete(playlist_id)
            return result
        except InvalidId:
            raise HTTPException(status_code=400, detail="ID playlist không hợp lệ")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể xóa playlist: {str(e)}")
        
    def add_song_to_playlist(self, playlist_id: str, song_id: str) -> bool:
        playlist = self.playlist_repo.find_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")

        # Tránh thêm trùng bài
        song_ids = playlist.get("songIds", [])
        if song_id in song_ids:
            return True  # đã có thì coi như thành công

        song_ids.append(song_id)
        return self.playlist_repo.update(playlist_id, {"songIds": song_ids})

    def remove_song_from_playlist(self, playlist_id: str, song_id: str) -> bool:
        playlist = self.playlist_repo.find_by_id(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")

        song_ids = playlist.get("songIds", [])
        if song_id not in song_ids:
            return True  # không có thì coi như đã xoá

        song_ids.remove(song_id)
        return self.playlist_repo.update(playlist_id, {"songIds": song_ids})

