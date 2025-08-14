# models/chat.py
from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    sender: str  # "user" hoặc "bot"
    text: str

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    history: List[ChatMessage]

class ChatHistory(BaseModel):
    user_id: str
    history: List[ChatMessage]
