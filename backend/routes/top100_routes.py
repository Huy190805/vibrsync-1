from fastapi import APIRouter, HTTPException
from database.repositories.song_repository import SongRepository
from bson import ObjectId
from database.db import songs_collection

router = APIRouter(prefix="/top100", tags=["Top 100 Songs"])

SUPPORTED_GENRES = [
    "love", "sad", "happy", "rap", "korean",
    "edm", "pop", "rock", "instrumental", "lofi", "usuk", "vpop","kpop","edm"
]

GENRE_MAP = {
    "love": "Love",
    "sad": "Sad",
    "happy": "Happy",
    "rap": "Rap",
    "korean": "Korean",
    "edm": "EDM",
    "pop": "Pop",
    "rock": "Rock",
    "instrumental": "Instrumental",
    "lofi": "Lo-fi",
    "usuk": "UK-US",
    "vpop": "Vietnamese",
    "kpop": "Korean",
    "edm": "EDM"

}


def convert_song(song: dict) -> dict:
    return {
        "id": str(song["_id"]) if "_id" in song else None,
        "title": song.get("title"),
        "artist": song.get("artist"),
        "cover_art": song.get("coverArt"),  # giữ đồng nhất camelCase
        "audioUrl": song.get("audioUrl"),
    }

# ✅ Route chung cho tất cả genre
@router.get("/{genre}")
def get_top_songs_by_genre(genre: str):
    genre = genre.lower()

    if genre not in SUPPORTED_GENRES:
        raise HTTPException(status_code=400, detail=f"Genre '{genre}' not supported.")
    
    db_genre = GENRE_MAP[genre]
    recs = list(songs_collection.find({ "genre": {"$in": [db_genre]} }).limit(100))

    return {
        "genre": genre,
        "total": len(recs),
        "songs": [convert_song(song) for song in recs]
    }

# ✅ Route riêng cho USUK
@router.get("/usuk-only")
async def get_top100_usuk_only():
    recs = list(songs_collection.find({ "genre": "UK-US" }).limit(100))
    return {
        "genre": "usuk",
        "total": len(recs),
        "songs": [convert_song(song) for song in recs]
    }

# ✅ Route riêng cho Love (nếu cần)
@router.get("/love-only")
async def get_top100_love_only():
    recs = list(songs_collection.find({ "genre": "Love" }).limit(100))
    return {
        "genre": "love",
        "total": len(recs),
        "songs": [convert_song(song) for song in recs]
    }


@router.get("/vpop-only")
async def get_top100_love_only():
    recs = list(songs_collection.find({ "genre": "Vietnamese" }).limit(100))
    return {
        "genre": "love",
        "total": len(recs),
        "songs": [convert_song(song) for song in recs]
    }