from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import Optional, List, Dict
from database.db import users_collection

class UserRepository:
    @staticmethod
    def find_by_email(email: str) -> Optional[Dict]:
        user = users_collection.find_one({"email": email.lower()})
        if user:
            user["_id"] = str(user["_id"])  # Đảm bảo _id là chuỗi
        return user

    @staticmethod
    def find_by_id(user_id: str) -> Optional[Dict]:
        # Thử tìm theo chuỗi trước
        user = users_collection.find_one({"_id": user_id})
        if user:
            user["_id"] = str(user["_id"])
            return user
        # Thử tìm theo ObjectId
        try:
            obj_id = ObjectId(user_id)
            user = users_collection.find_one({"_id": obj_id})
            if user:
                user["_id"] = str(user["_id"])
                return user
        except (InvalidId, TypeError):
            return None
        return None
    

    @staticmethod
    def find_all() -> List[Dict]:
        users = list(users_collection.find({}, {"hashed_password": 0}))
        for user in users:
            user["_id"] = str(user["_id"])  # Đảm bảo _id là chuỗi
        return users

    @staticmethod
    def search_by_name(query: str) -> List[Dict]:
        users = list(users_collection.find(
            {"name": {"$regex": query, "$options": "i"}},
            {"hashed_password": 0}
        ))
        for user in users:
            user["_id"] = str(user["_id"])  # Đảm bảo _id là chuỗi
        return users

    @staticmethod
    def create(user_data: Dict) -> str:
        user_data["_id"] = str(ObjectId())  # ⚠️ Dùng string _id
        user_data["created_at"] = datetime.utcnow()
        users_collection.insert_one(user_data)
        return user_data["_id"]

    @staticmethod
    def update(user_id: str, update_data: Dict) -> bool:
        update_data["updated_at"] = datetime.utcnow()

        # Try string-based update first
        result = users_collection.update_one({"_id": user_id}, {"$set": update_data})
        if result.matched_count > 0:
            return True

        # Fallback to ObjectId-based update
        try:
            obj_id = ObjectId(user_id)
            result = users_collection.update_one({"_id": obj_id}, {"$set": update_data})
            return result.matched_count > 0
        except (InvalidId, TypeError):
            return False

    @staticmethod
    def delete(user_id: str) -> bool:
    # Try delete by string-based id first
        result = users_collection.delete_one({"_id": user_id})
        if result.deleted_count > 0:
           return True

    # Fallback to ObjectId
        try:
           obj_id = ObjectId(user_id)
           result = users_collection.delete_one({"_id": obj_id})
           return result.deleted_count > 0
        except (InvalidId, TypeError):
           return False

