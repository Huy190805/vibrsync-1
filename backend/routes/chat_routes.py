from fastapi import APIRouter, HTTPException
from models.chat import ChatRequest, ChatResponse, ChatMessage, ChatHistory
from database.db import chat_history_collection
from utils.question_handler import handle_user_question

from datetime import datetime
import logging
from pydantic import ValidationError

logger = logging.getLogger("chat_logger")
logging.basicConfig(level=logging.INFO)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(payload: ChatRequest):
    user_id = payload.user_id
    user_message = (payload.message or "").strip()

    logger.info(f"[POST /chat] User ({user_id}) sent: '{user_message}'")

    if not user_message:
        raise HTTPException(status_code=400, detail="Tin nhắn không được để trống.")

    # Call your AI logic or fallback
    try:
        bot_reply = await handle_user_question(user_message)
        if not bot_reply:
            bot_reply = "Xin lỗi, tôi chưa hiểu bạn hỏi gì. Bạn có thể hỏi lại rõ hơn không?"
    except Exception as e:
        logger.error(f"[AI Handler Error] {str(e)}")
        bot_reply = "Hiện tại tôi không thể xử lý yêu cầu. Vui lòng thử lại sau."

    logger.info(f"[AI Response] Bot replied: '{bot_reply}'")

    now = datetime.utcnow()
    user_msg = ChatMessage(sender="user", text=user_message, timestamp=now)
    bot_msg = ChatMessage(sender="bot", text=bot_reply, timestamp=now)

    try:
        chat_history_collection.update_one(
            {"user_id": user_id},
            {"$push": {"messages": {"$each": [user_msg.dict(), bot_msg.dict()]}}},
            upsert=True
        )
        logger.info(f"[DB Update] Saved messages for user_id: {user_id}")
    except Exception as e:
        logger.error(f"[DB Error] Failed to save chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server khi lưu tin nhắn")

    updated_doc = chat_history_collection.find_one({"user_id": user_id})
    messages_raw = updated_doc.get("messages", []) if updated_doc else []

    history = []
    for msg in messages_raw:
        try:
            if msg.get("text") is not None:
                history.append(ChatMessage(**msg))
        except ValidationError as ve:
            logger.warning(f"[Skip] Invalid message skipped: {ve}")

    return ChatResponse(response=bot_reply, history=history)


@router.get("/chat/history/{user_id}", response_model=ChatHistory)
async def get_chat_history(user_id: str):
    logger.info(f"[GET /chat/history] Fetching history for user_id: {user_id}")

    doc = chat_history_collection.find_one({"user_id": user_id})
    if not doc:
        logger.warning(f"[NOT FOUND] No history for user: {user_id}")
        return {"user_id": user_id, "history": []}

    messages_raw = doc.get("messages", [])
    history = []
    for msg in messages_raw:
        try:
            if msg.get("text") is not None:
                history.append(ChatMessage(**msg))
        except ValidationError as ve:
            logger.warning(f"[Skip] Invalid message skipped: {ve}")

    logger.info(f"[History Found] Retrieved {len(history)} messages for user_id: {user_id}")
    return {"user_id": user_id, "history": history}


@router.delete("/chat/history/{user_id}")
async def delete_chat_history(user_id: str):
    logger.info(f"[DELETE /chat/history] Deleting history for user_id: {user_id}")
    try:
        result = chat_history_collection.delete_one({"user_id": user_id})
        if result.deleted_count == 0:
            logger.warning(f"[Delete Failed] No history to delete for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="Không tìm thấy lịch sử để xoá.")

        logger.info(f"[Delete Success] Deleted chat history for user_id: {user_id}")
        return {"message": f"Đã xoá lịch sử chat của user {user_id}"}
    except Exception as e:
        logger.error(f"[Delete Error] {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi server khi xoá lịch sử")
