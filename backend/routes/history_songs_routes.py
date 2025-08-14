from fastapi import APIRouter, HTTPException
from models.history import ListenHistoryModel
from database.db import history_collection, songs_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/api/history/listen")
async def save_listen_history(record: ListenHistoryModel):
    try:
        doc = {
            "user_id": ObjectId(record.user_id),
            "song_id": ObjectId(record.song_id),
        }

        # 🔍 Kiểm tra nếu đã tồn tại bản ghi giống nhau thì không lưu lại
        existing = history_collection.find_one(doc)
        if existing:
            return {"message": "🎧 Đã tồn tại trong lịch sử nghe"}

        doc["timestamp"] = datetime.utcnow()
        result = history_collection.insert_one(doc)

        return {
            "message": "🎧 Đã lưu lịch sử nghe",
            "history_id": str(result.inserted_id),
            "timestamp": doc["timestamp"].isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu: {e}")


@router.get("/api/history/user/{user_id}")
async def get_user_history(user_id: str):
    try:
        user_obj_id = ObjectId(user_id)

        # Lấy tất cả lịch sử sắp xếp theo thời gian mới nhất trước
        cursor = history_collection.find({"user_id": user_obj_id}).sort("timestamp", -1)

        unique_songs = {}
        for record in cursor:
            if "timestamp" not in record:
                continue  # 🛑 Bỏ qua nếu thiếu timestamp

            song_id_str = str(record["song_id"])
            if song_id_str not in unique_songs:
                song = songs_collection.find_one({"_id": record["song_id"]})
                unique_songs[song_id_str] = {
                    "_id": str(record["_id"]),  # thêm key _id để frontend dùng
                    "song_id": song_id_str,
                    "user_id": str(record["user_id"]),
                    "timestamp": record["timestamp"].isoformat(),
                    "song_info": {
                        "title": song["title"] if song else "Unknown",
                        "artist": song["artist"] if song else "Unknown",
                        "coverArt": song.get("coverArt", "") if song else "",
                        "audioUrl": song.get("audioUrl", "") if song else "",
                    }
                }

        return {"history": list(unique_songs.values())}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy lịch sử: {e}")
