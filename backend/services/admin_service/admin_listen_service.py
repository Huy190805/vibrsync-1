from database.db import listen_song_collection
from bson import ObjectId
from typing import List, Dict
from datetime import datetime


class AdminListenService:
    def __init__(self):
        self.collection = listen_song_collection

    def count_total_listens(self) -> int:
        return self.collection.count_documents({})

    def get_top_listened_songs(self, limit: int = 10) -> List[Dict]:
        pipeline = [
            {"$group": {"_id": "$song_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
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
                    "artist_name": "$song.artist",
                    "cover": "$song.coverArt",
                    "duration": "$song.duration",
                    "listen_count": "$count",
                }
            }
        ]

        results = list(self.collection.aggregate(pipeline))

        return results

    def get_listen_activity_by_date(self, start_date: datetime, end_date: datetime) -> List[Dict]:

        pipeline = [
            {"$match": {"listened_at": {"$gte": start_date, "$lte": end_date}}},
            {
                "$addFields": {
                    "parsed_date": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$listened_at"}, "date"]},
                            "then": "$listened_at",
                            "else": {"$toDate": "$listened_at"}
                        }
                    },
                    "song_oid": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$song_id"}, "string"]},
                            "then": {"$toObjectId": "$song_id"},
                            "else": "$song_id"
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$parsed_date"
                        }
                    },
                    "count": {"$sum": 1},
                    "song_ids": {"$push": "$song_oid"}
                }
            },
            {"$unwind": "$song_ids"},
            {
                "$lookup": {
                    "from": "songs",
                    "localField": "song_ids",
                    "foreignField": "_id",
                    "as": "song_info"
                }
            },
            {"$unwind": "$song_info"},
            {
                "$group": {
                    "_id": "$_id",
                    "count": {"$first": "$count"},
                    "songs": {
                        "$push": {
                            "title": "$song_info.title",
                            "cover": "$song_info.cover",
                            "artist": "$artist.name"
                        }
                    }
                }
            },
            {"$sort": {"_id": 1}}
        ]

        result = list(self.collection.aggregate(pipeline))
        return result