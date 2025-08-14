# db.py - MongoDB connection
from pymongo import MongoClient
from passlib.context import CryptContext
from bson import ObjectId
import datetime

client = MongoClient("mongodb+srv://trungdnbh00901:trudo42@vibesync.gaqe5kb.mongodb.net/?retryWrites=true&w=majority")
# client = MongoClient("mongodb://localhost:27017/")
db = client["Vibesync"]

history_collection = db["history"]
recommendations_collection = db["recommendations"]
playlists_collection = db["playlists"]
songs_collection = db["songs"]
artists_collection = db["artists"]
users_collection = db["users"]
song_history_collection = db["song_history"]
albums_collection = db["albums"]
artist_requests_collection = db["artist_requests"]
notifications_collection =db["notifications"]
follows_collection = db["follows"]
likes_collection = db["likes"]
payment_collection = db["payments"]
liked_songs_collection = db["liked_songs"]
chat_history_collection = db["chat_history"]
listen_song_collection = db["listen_song"]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

result1 = albums_collection.update_many(
    {"cover_art": ""},
    {"$set": {"cover_art": None}}
)
print(f"Updated {result1.modified_count} documents for cover_art")

# Cập nhật release_year không hợp lệ thành 2025
result2 = albums_collection.update_many(
    {"release_year": {"$lt": 1900}},
    {"$set": {"release_year": 2025}}
)
print(f"Updated {result2.modified_count} documents for release_year")

# Kiểm tra dữ liệu
print("Documents with empty cover_art:", albums_collection.count_documents({"cover_art": ""}))
print("Documents with invalid release_year:", albums_collection.count_documents({"release_year": {"$lt": 1900}}))