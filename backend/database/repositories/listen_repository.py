from database.db import listen_song_collection
from datetime import datetime

class ListenRepository:
    def __init__(self):
        self.collection = listen_song_collection

    def record_listen(self, user_id: str, song_id: str, listened_at: datetime, type: str = "listen"):
        """Ghi nhận lượt nghe (≥30s)"""
        self.collection.insert_one({
            "user_id": user_id,
            "song_id": song_id,
            "listened_at": listened_at,
            "type": type
        })

    def count_total_listens(self, song_id: str):
        """Tổng số lượt nghe của 1 bài hát"""
        return self.collection.count_documents({"song_id": song_id, "type": "listen"})

    def get_repeat_count(self, user_id: str, song_id: str):
        """Số lần nghe lại của 1 user cho 1 bài hát"""
        count = self.collection.count_documents({
            "user_id": user_id,
            "song_id": song_id,
            "type": "listen"
        })
        return max(0, count - 1)

    def get_listens_by_song(self, song_id: str):
        """Tất cả lượt nghe của 1 bài hát"""
        return list(self.collection.find({"song_id": song_id}))

    def get_listens_by_user(self, user_id: str):
        """Tất cả lượt nghe của 1 user"""
        return list(self.collection.find({"user_id": user_id}))

    def get_total_listens(self):
        """Tổng lượt nghe tất cả bài hát"""
        return self.collection.count_documents({})

    def get_top_listened_songs(self, limit: int = 10):
        """Top bài hát nghe nhiều nhất"""
        pipeline = [
            {"$match": {"type": "listen"}},
            {"$group": {"_id": "$song_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit}
        ]
        result = list(self.collection.aggregate(pipeline))
        for doc in result:
            doc["_id"] = str(doc["_id"])
        return result

    def get_listen_activity_by_date(self):
        """Thống kê lượt nghe theo ngày"""
        pipeline = [
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$listened_at"}},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        return list(self.collection.aggregate(pipeline))  # _id ở đây là string rồi, không cần đổi

    def get_top_repeated_songs(self, limit: int = 10):
        """Top bài hát được user nghe lại nhiều nhất"""
        pipeline = [
            {"$match": {"type": "listen"}},
            {"$group": {
                "_id": {"user_id": "$user_id", "song_id": "$song_id"},
                "repeat_count": {"$sum": 1}
            }},
            {"$match": {"repeat_count": {"$gt": 1}}},
            {"$group": {
                "_id": "$_id.song_id",
                "repeat_total": {"$sum": {"$subtract": ["$repeat_count", 1]}}
            }},
            {"$sort": {"repeat_total": -1}},
            {"$limit": limit}
        ]
        result = list(self.collection.aggregate(pipeline))
        for doc in result:
            doc["_id"] = str(doc["_id"])
        return result

    def get_top_searched_songs(self, limit: int = 10):
        """Top bài hát bị tìm kiếm nhiều nhất"""
        pipeline = [
            {"$match": {"type": "search"}},
            {"$group": {"_id": "$song_id", "search_count": {"$sum": 1}}},
            {"$sort": {"search_count": -1}},
            {"$limit": limit}
        ]
        result = list(self.collection.aggregate(pipeline))
        for doc in result:
            doc["_id"] = str(doc["_id"])
        return result

    def get_top_artists_by_listens(self, limit: int = 10):
        """Top nghệ sĩ có nhiều lượt nghe nhất"""
        pipeline = [
            {
                "$lookup": {
                    "from": "songs",
                    "localField": "song_id",
                    "foreignField": "_id",
                    "as": "song_info"
                }
            },
            {"$unwind": "$song_info"},
            {"$match": {"type": "listen"}},
            {"$group": {"_id": "$song_info.artistId", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": limit}
        ]
        result = list(self.collection.aggregate(pipeline))
        for doc in result:
            doc["_id"] = str(doc["_id"])
        return result

    def get_top_listened_songs_with_info(self, limit: int = 10):
        pipeline = [
            { "$match": { "type": "listen" } },
            { "$group": { "_id": "$song_id", "count": { "$sum": 1 } } },
            { "$sort": { "count": -1 } },
            { "$limit": limit },
            {
                "$addFields": {
                    "song_oid": {
                        "$cond": {
                            "if": { "$eq": [ { "$type": "$_id" }, "string" ] },
                            "then": { "$toObjectId": "$_id" },
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
            { "$unwind": { "path": "$song", "preserveNullAndEmptyArrays": False } },
            {
                "$project": {
                    "song_id": { "$toString": "$_id" },
                    "title": "$song.title",
                    "artist_name": "$song.artist",
                    "cover": { "$ifNull": ["$song.coverArt", "/placeholder.svg"] },
                    "audioUrl": "$song.audioUrl",
                    "duration": "$song.duration",
                    "listen_count": "$count"
                }
            }
        ]
        return list(self.collection.aggregate(pipeline))

    def get_top_searched_songs_with_info(self, limit: int = 10):
        pipeline = [
            { "$match": { "type": "search" } },
            { "$group": { "_id": "$song_id", "search_count": { "$sum": 1 } } },
            { "$sort": { "search_count": -1 } },
            { "$limit": limit },
            {
                "$addFields": {
                    "song_oid": {
                        "$cond": {
                            "if": { "$eq": [ { "$type": "$_id" }, "string" ] },
                            "then": { "$toObjectId": "$_id" },
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
            { "$unwind": { "path": "$song", "preserveNullAndEmptyArrays": False } },
            {
                "$project": {
                    "song_id": { "$toString": "$_id" },
                    "title": "$song.title",
                    "artist_name": "$song.artist",
                    "cover": { "$ifNull": ["$song.coverArt", "/placeholder.svg"] },
                    "search_count": 1
                }
            }
        ]
        return list(self.collection.aggregate(pipeline))


