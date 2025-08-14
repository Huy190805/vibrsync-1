from bson import ObjectId
from database.db import notifications_collection
from datetime import datetime


class NotificationRepository:
    collection = notifications_collection

    @staticmethod
    async def create(notif_data):
        notif = notif_data.dict()
        notif["read"] = False
        notif["created_at"] = datetime.utcnow()

        # ép user_id về ObjectId
        notif["user_id"] = ObjectId(notif["user_id"])

        result = NotificationRepository.collection.insert_one(notif)
        notif["_id"] = str(result.inserted_id)
        
        notif["user_id"] = str(notif["user_id"])
        notif["created_at"] = notif["created_at"].isoformat()

        return notif
    
    @staticmethod
    async def list_all(user_id):
        cursor = NotificationRepository.collection.find({"user_id": ObjectId(user_id)})
        results = []
        for notif in cursor:  
            notif["id"] = str(notif["_id"])
            del notif["_id"]
            notif["user_id"] = str(notif["user_id"])
            if "created_at" not in notif:
                notif["created_at"] = None  
            else:
                notif["created_at"] = notif["created_at"].isoformat()
            results.append(notif)
        return results
    
    @staticmethod
    async def delete(notif_id):
        result = NotificationRepository.collection.delete_one({"_id": ObjectId(notif_id)})
        return {"deleted": result.deleted_count}


