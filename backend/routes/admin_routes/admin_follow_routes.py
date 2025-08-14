# routes/admin_routes/admin_follow_routes.py
from fastapi import APIRouter, HTTPException, Depends
from services.admin_service.admin_follow_service import AdminFollowService
from auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/admin/follow", tags=["admin_follow"])

admin_follow_service = AdminFollowService()

# ✅ GET total followers (all follows)
@router.get("/total-followers", response_model=dict)
async def get_total_followers(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required")
    total_followers = admin_follow_service.count_total_followers()
    return {"totalFollowers": total_followers}

# ✅ GET unique followers
@router.get("/unique-followers", response_model=dict)
async def get_unique_followers(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required")
    unique_followers = admin_follow_service.count_unique_followers()
    return {"uniqueFollowers": unique_followers}

# ✅ GET follow activity by date range
@router.get("/activity", response_model=dict)
async def get_follow_activity(start_date: str, end_date: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required")
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        activity = admin_follow_service.get_follow_activity_by_date(start, end)
        return {"followActivity": activity}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS).")

# ✅ GET top followed artists
@router.get("/top-artists", response_model=dict)
async def get_top_followed_artists(limit: int = 10, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required")
    top_artists = admin_follow_service.get_top_followed_artists(limit)
    return {"topFollowedArtists": top_artists}

@router.get("/followed-users", response_model=dict)
async def get_followed_users(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required")
    followed_users = admin_follow_service.get_all_follow_users()
    return {"users": followed_users}


@router.get("/followed-artists", response_model=dict)
async def get_followed_artists(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required")
    followed_artists = admin_follow_service.get_all_followed_artists()
    return {"artists": followed_artists}
