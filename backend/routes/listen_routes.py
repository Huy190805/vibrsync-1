# routes/listen_routes.py
from fastapi import APIRouter
from models.listen_song import ListenSongRequest
from services.listen_service import ListenService

router = APIRouter(prefix="/api/listens", tags=["listens"])
listen_service = ListenService()

@router.get("/count/{song_id}")
def count_total_listens(song_id: str):
    total = listen_service.repo.count_total_listens(song_id)
    return {"song_id": song_id, "total": total}

# ✅ Ghi nhận hành vi (nghe hoặc tìm kiếm)
@router.post("/record")
def record_listen(data: ListenSongRequest):
    listen_service.record_listen(data)
    return {"message": "✅ Listen/search recorded successfully"}

@router.get("/top")
def get_top_listened_songs(limit: int = 10):
    top_songs = listen_service.repo.get_top_listened_songs(limit=limit)
    return top_songs

@router.get("/activity-by-date")
def get_listen_activity_by_date():
    activity = listen_service.repo.get_listen_activity_by_date()
    return activity

# ✅ Top bài hát được nghe lại nhiều nhất
@router.get("/top-repeated")
def get_top_repeated_songs(limit: int = 10):
    return listen_service.repo.get_top_repeated_songs(limit=limit)

# ✅ Top bài hát được tìm kiếm nhiều nhất
@router.get("/top-searched")
def get_top_searched_songs(limit: int = 10):
    return listen_service.repo.get_top_searched_songs(limit=limit)

@router.get("/top-artists")
def get_top_artists_by_listens(limit: int = 10):
    return listen_service.repo.get_top_artists_by_listens(limit=limit)

@router.get("/history/repeat-count")
def get_repeat_count(user_id: str, song_id: str):
    service = ListenService()
    count = service.get_repeat_count(user_id, song_id)
    return {"repeat_count": count}

@router.get("/top-with-info")
def get_top_listened_songs_with_info(limit: int = 10):
    return listen_service.repo.get_top_listened_songs_with_info(limit=limit)
