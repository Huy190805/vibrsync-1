from fastapi import APIRouter, Query
from services.recommendation_service import get_recommendations

router = APIRouter()

@router.get("/recommendations")
def recommend(user_id: str = Query(...), limit: int = 12):
    recs = get_recommendations(user_id, limit)
    return [{
        "id": str(song["_id"]),
        "title": song.get("title"),
        "artist": song.get("artist"),
        "coverArt": song.get("coverArt"),
        "audioUrl": song.get("audioUrl"),  # ✅ trả đúng tên key
        "duration": song.get("duration"),
        "album": song.get("album"),
        "releaseYear": song.get("releaseYear"),
    } for song in recs]

