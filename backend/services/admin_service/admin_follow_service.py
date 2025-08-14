from database.db import follows_collection
from database.repositories.follow_repository import FollowRepository
from datetime import datetime
from typing import List, Dict

class AdminFollowService:
    def __init__(self):
        self.follow_repo = FollowRepository()

    def count_total_followers(self) -> int:
        count = follows_collection.count_documents({})

        return count

    def count_unique_followers(self) -> int:
        pipeline = [
            {"$group": {"_id": "$user_id"}},
            {"$count": "unique_users"}
        ]
        result = follows_collection.aggregate(pipeline)
        unique = next(result, {"unique_users": 0})["unique_users"]

        return unique

    def get_follow_activity_by_date(self, start_date: datetime, end_date: datetime) -> List[dict]:
        pipeline = [
            {"$match": {"followed_at": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$followed_at"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        activity = list(follows_collection.aggregate(pipeline))

        for day in activity:
            print(f"  {day['_id']}: {day['count']} lượt follow")
        return activity

    def get_top_followed_artists(self, limit: int = 10) -> List[dict]:
        pipeline = [
            {"$group": {"_id": "$artist_id", "follower_count": {"$sum": 1}}},
            {"$sort": {"follower_count": -1}},
            {"$limit": limit},
            {"$lookup": {
                "from": "artists",
                "localField": "_id",
                "foreignField": "_id",
                "as": "artist"
            }},
            {"$unwind": "$artist"},
            {"$project": {
                "artist_id": {"$toString": "$_id"},
                "artist_name": "$artist.name",
                "follower_count": 1
            }}
        ]
        top_artists = list(follows_collection.aggregate(pipeline))

        for rank, artist in enumerate(top_artists, start=1):
            print(f"{rank}. {artist['artist_name']} ({artist['follower_count']} lượt follow)")
        return top_artists

    def get_all_follow_users(self) -> List[Dict]:
        pipeline = [
            {"$addFields": {"user_id_str": {"$toString": "$user_id"}}},
            {
                "$lookup": {
                    "from": "users",
                    "let": {"user_id_str": "$user_id_str"},
                    "pipeline": [
                        {"$addFields": {"_id_str": {"$toString": "$_id"}}},
                        {"$match": {"$expr": {"$eq": ["$_id_str", "$$user_id_str"]}}}
                    ],
                    "as": "user"
                }
            },
            {"$unwind": "$user"},
            {
                "$group": {
                    "_id": "$user._id",
                    "name": {"$first": "$user.name"},
                    "email": {"$first": "$user.email"}
                }
            },
            {"$sort": {"name": 1}}
        ]
        result = follows_collection.aggregate(pipeline)
        users = []

        for doc in result:
            user_info = {
                "id": str(doc["_id"]),
                "name": doc.get("name", "Unknown"),
                "email": doc.get("email", "N/A")
            }

            users.append(user_info)

        if not users:
            print("⚠️ Không có user nào đã follow.")
        return users

    def get_all_followed_artists(self) -> List[Dict]:
        pipeline = [
            {"$lookup": {
                "from": "artists",
                "localField": "artist_id",
                "foreignField": "_id",
                "as": "artist"
            }},
            {"$unwind": "$artist"},
            {"$group": {
                "_id": "$artist._id",
                "name": {"$first": "$artist.name"},
                "genre": {"$first": "$artist.genre"},
                "image": {"$first": "$artist.image"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1, "name": 1}}
        ]
        result = follows_collection.aggregate(pipeline)
        followed_artists = []

        for artist in result:
            artist_info = {
                "id": str(artist["_id"]),
                "name": artist["name"],
                "genre": artist.get("genre", "Unknown"),
                "image": artist.get("image", "N/A"),
                "follower_count": artist["count"]
            }

            followed_artists.append(artist_info)

        if not followed_artists:
            print("⚠️ Không có nghệ sĩ nào được follow.")
        return followed_artists
