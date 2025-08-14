from database.db import db
from datetime import datetime

class LikeService:
    def is_liked(self, user_id: str, song_id: str) -> bool:
        return db["liked_songs"].find_one({"user_id": user_id, "song_id": song_id}) is not None

    def like(self, user_id: str, song_id: str):
        db["liked_songs"].insert_one({
            "user_id": user_id,
            "song_id": song_id,
            "liked_at": datetime.utcnow()
        })

    def unlike(self, user_id: str, song_id: str):
        db["liked_songs"].delete_one({
            "user_id": user_id,
            "song_id": song_id
        })

    def count_likes(self, song_id: str) -> int:
        return db["liked_songs"].count_documents({"song_id": song_id})