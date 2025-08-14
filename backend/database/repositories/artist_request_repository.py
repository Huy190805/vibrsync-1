from database.db import artist_requests_collection
from bson import ObjectId
from typing import List, Optional

class ArtistRequestRepository:
    def __init__(self):
        self.collection = artist_requests_collection

    def create(self, request_dict: dict) -> str:
        result = self.collection.insert_one(request_dict)
        return str(result.inserted_id)

    def find_by_id(self, request_id: str) -> Optional[dict]:
        return self.collection.find_one({"_id": ObjectId(request_id)})

    def find_by_user_id(self, user_id: str) -> Optional[dict]:
        return self.collection.find_one({"user_id": user_id})

    def find_all(self, status: Optional[str] = None) -> List[dict]:
        query = {"status": status} if status else {}
        return list(self.collection.find(query))

    def update(self, request_id: str, update_data: dict) -> bool:
        result = self.collection.update_one({"_id": ObjectId(request_id)}, {"$set": update_data})
        return result.matched_count > 0

    def delete(self, request_id: str) -> bool:
        result = self.collection.delete_one({"_id": ObjectId(request_id)})
        return result.deleted_count > 0
    
    