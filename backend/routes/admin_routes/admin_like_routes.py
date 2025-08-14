from fastapi import APIRouter, Depends, HTTPException
from services.admin_service.admin_like_service import AdminLikeService
from auth import get_current_user

router = APIRouter(prefix="/admin/likes", tags=["admin_likes"])
like_service = AdminLikeService()

@router.get("/most-liked-songs")
def get_most_liked_songs(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403)
    return {"most_liked": like_service.get_most_liked_songs()}

@router.get("/total-likes")
def get_total_likes(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403)
    return {"totalLikes": like_service.count_total_likes()}

@router.get("/unique-likers")
def get_unique_likers(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403)
    return {"uniqueLikers": like_service.count_unique_likers()}

@router.get("/liking-users")
def get_liking_users(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403)
    return {"users": like_service.get_all_liking_users()}
