# services/admin_service/admin_like_service.py

from database.db import liked_songs_collection
from bson import ObjectId

class AdminLikeService:
    def get_most_liked_songs(self, limit=20):
        pipeline = [
            {"$group": {"_id": "$song_id", "like_count": {"$sum": 1}}},
            {"$sort": {"like_count": -1}},
            {"$limit": limit},
            {
                "$addFields": {
                    "song_oid": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$_id"}, "string"]},
                            "then": {"$toObjectId": "$_id"},
                            "else": "$_id"
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": "songs",
                    "localField": "song_oid",
                    "foreignField": "_id",
                    "as": "song"
                }
            },
            {"$unwind": "$song"},
            {
                "$project": {
                    "song_id": {"$toString": "$_id"},
                    "title": "$song.title",
                    "artist": "$song.artist",
                    "image": {
                        "$ifNull": ["$song.coverArt", "$song.image"]
                    },
                    "like_count": 1
                }
            }
        ]
        return list(liked_songs_collection.aggregate(pipeline))

    def count_total_likes(self):
        return liked_songs_collection.count_documents({})

    def count_unique_likers(self):
        pipeline = [{"$group": {"_id": "$user_id"}}, {"$count": "count"}]
        result = liked_songs_collection.aggregate(pipeline)
        return next(result, {"count": 0})["count"]

    def get_all_liking_users(self):
        pipeline = [
            {"$addFields": {"user_id_str": {"$toString": "$user_id"}}},
            {"$lookup": {
                "from": "users",
                "let": {"uid": "$user_id_str"},
                "pipeline": [
                    {"$addFields": {"_id_str": {"$toString": "$_id"}}},
                    {"$match": {"$expr": {"$eq": ["$_id_str", "$$uid"]}}}
                ],
                "as": "user"
            }},
            {"$unwind": "$user"},
            {"$group": {
                "_id": "$user._id",
                "name": {"$first": "$user.name"},
                "email": {"$first": "$user.email"}
            }},
            {"$sort": {"name": 1}}
        ]
        return list(liked_songs_collection.aggregate(pipeline))
