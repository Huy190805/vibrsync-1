from database.db import follows_collection, artists_collection
from datetime import datetime
from bson import ObjectId

class FollowService:

    def is_following(self, user_id: str, artist_id: str) -> bool:
        follow = follows_collection.find_one({
            "user_id": ObjectId(user_id),
            "artist_id": ObjectId(artist_id)
        })
        return follow is not None

    def follow(self, user_id: str, artist_id: str):
        follows_collection.insert_one({
            "user_id": ObjectId(user_id),
            "artist_id": ObjectId(artist_id),
            "followed_at": datetime.utcnow()
        })

    def unfollow(self, user_id: str, artist_id: str):
        follows_collection.delete_one({
            "user_id": ObjectId(user_id),
            "artist_id": ObjectId(artist_id)
        })

    def count_followers(self, artist_id: str) -> int:
        return follows_collection.count_documents({
            "artist_id": ObjectId(artist_id)
        })

    def get_followed_artist_ids(self, user_id: str) -> list:
        follows = follows_collection.find({"user_id": ObjectId(user_id)})
        return [str(f["artist_id"]) for f in follows]

    def get_followed_artists(self, user_id: str) -> list:
        followed_ids = self.get_followed_artist_ids(user_id)

        if not followed_ids:
            return []

        artists = list(artists_collection.find({
            "_id": {"$in": [ObjectId(artist_id) for artist_id in followed_ids]}
        }))

        # Format lại cho frontend
        for artist in artists:
            artist["id"] = str(artist["_id"])
            artist.pop("_id", None)

        return artists
