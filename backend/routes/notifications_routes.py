from fastapi import APIRouter, Depends
from models.notification import NotificationCreate, NotificationOut
from services.notification_service import NotificationService
from auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("/", response_model=list[NotificationOut])
async def get_notifications(user=Depends(get_current_user)):
    return await NotificationService.list_notifications(str(user["id"]))

@router.post("")
async def create_notification(
    notif: NotificationCreate,
    user = Depends(get_current_user),
):
    return await NotificationService.create_notification(notif)

@router.post("/{notif_id}/mark-read")
async def mark_read(notif_id: str):
    return await NotificationService.mark_as_read(notif_id)

@router.delete("/{notif_id}")
async def delete_notification(notif_id: str):
    return await NotificationService.delete_notification(notif_id)

