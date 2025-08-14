from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from auth import get_current_user
from services.admin_service.admin_listen_service import AdminListenService

router = APIRouter(prefix="/admin/statistics", tags=["admin-listen"])


@router.get("/top-listened-songs")
def get_top_listened_songs(limit: int = 10, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    service = AdminListenService()
    top_songs = service.get_top_listened_songs(limit=limit)
    return top_songs


@router.get("/total-listens")
def get_total_listens(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    service = AdminListenService()
    return {"total_listens": service.count_total_listens()}


@router.get("/listen-activity")
def get_listen_activity_by_date(
    start_date: str = Query(...),
    end_date: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        start = datetime.fromisoformat(start_date + "T00:00:00")
        end = datetime.fromisoformat(end_date + "T23:59:59")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    service = AdminListenService()
    return service.get_listen_activity_by_date(start, end)
