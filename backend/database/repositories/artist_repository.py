from database.db import artists_collection
from bson import ObjectId
from typing import List, Optional
from difflib import get_close_matches

class ArtistRepository:
    def __init__(self):
        self.collection = artists_collection

    def find_all(self, skip: int = 0, limit: Optional[int] = None) -> List[dict]:
        cursor = self.collection.find({}).skip(skip)
        if limit is not None:
            cursor = cursor.limit(limit)
        return list(cursor)
    
    def find_by_name(self, name: str) -> List[dict]:
     return list(self.collection.find({"name": {"$regex": f"^{name}$", "$options": "i"}}))

    def find_by_id(self, artist_id: ObjectId) -> Optional[dict]:
        return self.collection.find_one({"_id": artist_id})

    def insert_one(self, artist_dict: dict):
        return self.collection.insert_one(artist_dict)

    def update_one(self, artist_id: ObjectId, update_data: dict):
        return self.collection.update_one({"_id": artist_id}, {"$set": update_data})

    def update(self, artist_id: str, update_data: dict):
        return self.update_one(ObjectId(artist_id), update_data)

    def delete_one(self, artist_id: ObjectId):
        return self.collection.delete_one({"_id": artist_id})
    
    def get_similar_artists(self, query: str, limit=5) -> List[dict]:
        all_artists = list(self.collection.find({}, {"name": 1}))  # chỉ lấy name và _id
        artist_names = [a["name"] for a in all_artists]
        matches = get_close_matches(query, artist_names, n=limit, cutoff=0.6)
    
        matched_artists = [a for a in all_artists if a["name"] in matches]
        return matched_artists

    def update_by_id(self, artist_id: ObjectId, update_dict: dict):
        return self.collection.update_one({"_id": artist_id}, {"$set": update_dict})
    
    def get_all_names(self):
        # Trả về danh sách tất cả tên nghệ sĩ (chuẩn hóa)
        return [artist["name"].lower() for artist in self.collection.find({}, {"name": 1})]