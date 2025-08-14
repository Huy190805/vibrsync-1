from database.repositories.notification_repository import NotificationRepository
from bson import ObjectId
from datetime import datetime

class NotificationService:
    @staticmethod
    async def create_notification(notif_data):
        # ✅ Kiểm tra nếu là login thì không tạo nếu đã tồn tại hôm nay
        if notif_data.type == "login":
            today = datetime.utcnow().strftime("%Y-%m-%d")
            existing = await NotificationRepository.collection.find_one({
                "user_id": notif_data.user_id,
                "type": "login",
                "created_at": {"$regex": f"^{today}"}
            })
            if existing:
                return {"message": "Login notification already exists today."}

        return await NotificationRepository.create(notif_data)

    @staticmethod
    async def list_notifications(user_id):
        return await NotificationRepository.list_all(user_id)

    @staticmethod
    async def mark_read(notif_id):
        result = NotificationRepository.collection.update_one(
            {"_id": ObjectId(notif_id)},
            {"$set": {"read": True}}
        )
        return {"updated": result.modified_count}
    
    @staticmethod
    async def delete_notification(notif_id):  
        return await NotificationRepository.delete(notif_id)