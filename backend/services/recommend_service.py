from database.db import (
    song_history_collection, songs_collection,
    likes_collection, follows_collection, artists_collection
)
from bson import ObjectId
from datetime import datetime
from collections import Counter
from typing import List


def get_recommendations(user_id: str, limit: int = 10) -> List[dict]:
    user_oid = ObjectId(user_id)

    # 1. Lấy toàn bộ lịch sử nghe
    history = list(song_history_collection.find({"user_id": user_oid}))
    if not history:
        print("❌ No listening history found.")
        return []

    # 2. Tính tần suất và lấy 5 bài gần nhất
    song_id_counter = Counter([entry["song_id"] for entry in history])
    history_sorted = sorted(history, key=lambda x: x.get("timestamp", datetime.min), reverse=True)
    recent_entries = history_sorted[:5]

    recent_songs = [songs_collection.find_one({"_id": entry["song_id"]}) for entry in recent_entries]
    recent_songs = [s for s in recent_songs if s]

    # 3. Tổng hợp đặc điểm từ các bài gần nhất
    all_artists = set()
    all_genres = set()
    all_tags = set()

    for song in recent_songs:
        if "artist" in song:
            all_artists.add(song["artist"])
        all_genres.update(song.get("genre", []))
        all_tags.update(song.get("tags", []))

    # 4. Lấy danh sách nghệ sĩ được like hoặc follow
    liked_artist_ids = set()
    followed_artist_ids = set()

    for doc in likes_collection.find({"user_id": user_oid, "type": "artist"}):
        liked_artist_ids.add(doc["item_id"])

    for doc in follows_collection.find({"user_id": user_oid, "type": "artist"}):
        followed_artist_ids.add(doc["item_id"])

    # Lấy tên nghệ sĩ từ ID
    artist_ids = list(liked_artist_ids | followed_artist_ids)
    if artist_ids:
        liked_followed_artists = artists_collection.find({"_id": {"$in": artist_ids}})
        for artist in liked_followed_artists:
            all_artists.add(artist["name"])

    print(f"🎧 Collected from recent + liked/followed:")
    print(f" - Artists: {list(all_artists)}")
    print(f" - Genres: {list(all_genres)}")
    print(f" - Tags: {list(all_tags)}")

    # 5. Truy vấn gợi ý từ đặc điểm trên
    query = {
        "$or": [
            {"artist": {"$in": list(all_artists)}},
            {"genre": {"$in": list(all_genres)}},
            {"tags": {"$in": list(all_tags)}}
        ]
    }
    raw_candidates = list(songs_collection.find(query).limit(limit * 4))

    # 6. Loại bỏ bài đã nghe gần nhất (đặc biệt bài cuối cùng vừa nghe)
    recently_played_ids = {entry["song_id"] for entry in recent_entries}
    seen_ids = set(song_id_counter.keys())

    recommended = []
    for song in raw_candidates:
        song_id = song["_id"]
        if song_id in recently_played_ids:
            continue  # ❌ bỏ bài vừa nghe
        if song_id not in seen_ids or song_id_counter[song_id] < 3:
            recommended.append(song)
        if len(recommended) >= limit:
            break

    # 7. Fallback nếu chưa đủ
    if len(recommended) < limit:
        remaining = limit - len(recommended)
        print(f"➕ Not enough recommendations, adding {remaining} fallback songs.")

        fallback = list(songs_collection.find({
            "_id": {"$nin": list(recently_played_ids)}
        }).sort("releaseYear", -1).limit(remaining))

        recommended.extend(fallback)

        if len(recommended) < limit:
            more_random = list(songs_collection.aggregate([
                {"$match": {"_id": {"$nin": list(recently_played_ids)}}},
                {"$sample": {"size": limit - len(recommended)}}
            ]))
            recommended.extend(more_random)

    print(f"✅ Final recommendations ({len(recommended)}):")
    for i, s in enumerate(recommended[:limit]):
        print(f"  #{i + 1}: {s['title']} by {s['artist']}")

    return recommended[:limit]