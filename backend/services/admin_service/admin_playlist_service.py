from datetime import datetime
from typing import List
from fastapi import HTTPException
from bson import ObjectId

from database.repositories.playlist_repository import PlaylistRepository
from models.playlist import PlaylistInDB
from database.db import songs_collection  # ✅ cần import

class AdminPlaylistService:
    def __init__(self):
        self.repo = PlaylistRepository()

    def get_all_playlists(self, search: str = "", skip: int = 0, limit: int = 10) -> List[PlaylistInDB]:
        try:
            all_playlists = self.repo.find_all()

            if search:
                all_playlists = [
                    p for p in all_playlists if search.lower() in p.get("title", "").lower()
                ]

            paginated = all_playlists[skip: skip + limit]

            playlists = []
            for p in paginated:
                p.setdefault("created_at", datetime.utcnow())
                p.setdefault("updated_at", None)
                p.setdefault("coverArt", "https://via.placeholder.com/640x640.png?text=Playlist+Cover")
                p.setdefault("songIds", [])
                p.setdefault("creator", "You")
                p.setdefault("isPublic", True)
                p.setdefault("isShuffle", False)

                # ✅ Truy vấn thông tin bài hát
                song_ids = p.get("songIds", [])
                if song_ids:
                    song_docs = list(songs_collection.find({"_id": {"$in": [ObjectId(sid) for sid in song_ids]}}))
                    # Format lại dữ liệu nếu cần (loại bỏ _id...)
                    p["songs"] = [
                        {
                            "id": str(song["_id"]),
                            "title": song.get("title"),
                            "artist": song.get("artist"),
                            "duration": song.get("duration"),
                            "releaseYear": song.get("releaseYear"),
                        }
                        for song in song_docs
                    ]
                else:
                    p["songs"] = []

                playlists.append(PlaylistInDB(**p))

            return playlists
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AdminPlaylistService Error: {str(e)}")
