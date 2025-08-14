from database.db import songs_collection, song_history_collection, chat_history_collection
from bson import ObjectId
from collections import Counter
import re

def extract_keywords(text):
    return re.findall(r'\w+', text.lower())

def get_recent_chat_keywords(user_id: str, max_keywords=5):
    doc = chat_history_collection.find_one({"user_id": ObjectId(user_id)})
    if not doc or "history" not in doc:
        return []
    messages = [msg for msg in reversed(doc["history"]) if msg.get("sender") == "user"]
    latest_msg = messages[0].get("text", "").lower() if messages else ""
    return extract_keywords(latest_msg)[:max_keywords]

def get_recommendations(user_id: str, limit: int = 20):
    print("🔁 Running hybrid recommendation engine for user:", user_id)

    # 1. Lấy lịch sử nghe
    history = list(song_history_collection.find({"user_id": ObjectId(user_id)}))
    song_ids = [ObjectId(entry["song_id"]) for entry in history]
    listened_songs = list(songs_collection.find({"_id": {"$in": song_ids}}))

    # 2. Thống kê thuộc tính nghe
    genre_counter, artist_counter, album_counter, keyword_counter = Counter(), Counter(), Counter(), Counter()
    for song in listened_songs:
        genre_counter.update(song.get("genre", []))
        artist_counter[song.get("artist", "")] += 1
        album_counter[song.get("album", "")] += 1
        keyword_counter.update(extract_keywords(song.get("title", "")))

    top_genres = [g for g, _ in genre_counter.most_common(3)]
    top_artists = [a for a, _ in artist_counter.most_common(2)]
    top_albums = [a for a, _ in album_counter.most_common(2)]
    top_keywords = [k for k, _ in keyword_counter.most_common(5)]

    # 3. Phân tích từ khóa từ chat
    chat_keywords = get_recent_chat_keywords(user_id)
    print("💬 Chat keywords:", chat_keywords)

    # 4. Nếu không có lịch sử nghe
    if not listened_songs and chat_keywords:
        print("⚠️ No history → recommending by chat only")
        keyword_query = [{"title": {"$regex": k, "$options": "i"}} for k in chat_keywords]
        chat_query = {"$or": keyword_query}
        return list(songs_collection.find(chat_query).limit(limit))

    if not listened_songs and not chat_keywords:
        print("📭 No data → fallback to latest songs")
        return list(songs_collection.find().sort("releaseYear", -1).limit(limit))

    # 5. Thói quen lặp lại
    repetition_map = Counter(entry["song_id"] for entry in history)
    repetition_song_ids = [sid for sid, count in repetition_map.items() if count >= 3]
    repeated_songs = list(songs_collection.find({
        "_id": {"$in": [ObjectId(sid) for sid in repetition_song_ids]}
    }))
    repeated_artists = {song["artist"] for song in repeated_songs}
    repeated_albums = {song["album"] for song in repeated_songs}

    # 6. Truy vấn gợi ý nội dung
    combined_keywords = list(set(top_keywords + chat_keywords))
    title_query = [{"title": {"$regex": k, "$options": "i"}} for k in combined_keywords]

    content_query = {
        "$or": [
            {"genre": {"$in": top_genres}},
            {"artist": {"$in": list(repeated_artists or top_artists)}},
            {"album": {"$in": list(repeated_albums or top_albums)}},
            {"tags": {"$in": combined_keywords}},
            *title_query
        ],
        "_id": {"$nin": song_ids}
    }

    content_songs = list(songs_collection.find(content_query).limit(limit * 4))
    print(f"🎯 Found {len(content_songs)} recommended by content")

    combined = {str(song["_id"]): song for song in content_songs}

    # 7. Fallback nếu chưa đủ
    if len(combined) < limit:
        extra_needed = limit - len(combined)
        exclude_ids = set(song_ids)
        exclude_ids.update(ObjectId(k) for k in combined.keys())

        print(f"➕ Adding {extra_needed} fallback songs")
        extra_songs = songs_collection.find({
            "_id": {"$nin": list(exclude_ids)}
        }).sort("releaseYear", -1).limit(extra_needed * 4)

        for song in extra_songs:
            combined[str(song["_id"])] = song
            if len(combined) >= limit:
                break

    final_songs = list(combined.values())[:limit]
    print(f"✅ Final songs count: {len(final_songs)}")
    return final_songs