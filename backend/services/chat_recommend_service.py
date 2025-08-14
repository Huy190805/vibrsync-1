# services/chat_recommend_service.py
from database.db import chat_history_collection, songs_collection
from bson import ObjectId
import re

def extract_keywords(text):
    return re.findall(r'\w+', text.lower())

def get_recommendations_from_chat(user_id: str, limit: int = 10):
    print("💬 Gợi ý nhạc từ nội dung hội thoại cho user:", user_id)

    doc = chat_history_collection.find_one({"user_id": ObjectId(user_id)})
    if not doc or "history" not in doc:
        print("📭 Không có lịch sử chat.")
        return []

    # 🔁 Lọc tin nhắn gần nhất từ người dùng
    messages = [msg for msg in reversed(doc["history"]) if msg.get("sender") == "user"]
    if not messages:
        print("📭 Không có tin nhắn người dùng.")
        return []

    latest_msg = messages[0].get("text", "").lower()
    keywords = extract_keywords(latest_msg)
    print("🔍 Keywords tìm được:", keywords)

    query = {}

    if any(k in keywords for k in ["buồn", "sad", "tâm trạng"]):
        query = {"tags": {"$in": ["sad", "emotional"]}}

    elif any(k in keywords for k in ["vui", "happy", "sôi động"]):
        query = {"tags": {"$in": ["happy", "party", "upbeat"]}}

    elif "sơn tùng" in latest_msg:
        query = {"artist": {"$regex": "sơn tùng", "$options": "i"}}

    elif "cổ điển" in latest_msg:
        query = {"genre": {"$in": ["classical"]}}

    elif "không lời" in latest_msg:
        query = {"genre": {"$in": ["instrumental"]}}

    else:
        # fallback tìm theo title
        keyword_query = [{"title": {"$regex": k, "$options": "i"}} for k in keywords]
        query = {"$or": keyword_query}

    print("📥 Truy vấn:", query)
    results = list(songs_collection.find(query).limit(limit))
    return results