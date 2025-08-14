from database.db import follows_collection
from datetime import datetime

class FollowRepository:
    def __init__(self):
        self.collection = follows_collection

    def follow(self, user_id: str, artist_id: str):
        existing = self.collection.find_one({"user_id": user_id, "artist_id": artist_id})
        if existing:
            return False  # Đã follow
        self.collection.insert_one({
            "user_id": user_id,
            "artist_id": artist_id,
            "followed_at": datetime.utcnow()
        })
        return True

    def unfollow(self, user_id: str, artist_id: str):
        result = self.collection.delete_one({"user_id": user_id, "artist_id": artist_id})
        return result.deleted_count > 0

    def is_following(self, user_id: str, artist_id: str) -> bool:
        return self.collection.find_one({"user_id": user_id, "artist_id": artist_id}) is not None

    def get_followed_artist_ids(self, user_id: str):
        return [f["artist_id"] for f in self.collection.find({"user_id": user_id})]
