from fastapi import APIRouter, Request
import logging

router = APIRouter()

@router.post("/webhook/payment-success")
async def payment_success(request: Request):
    data = await request.json()
    logging.info(f"Payment success webhook: {data}")
    # TODO: Cập nhật trạng thái user thành đã nâng cấp
    return {"message": "Payment success received"}

@router.post("/webhook/payment-cancel")
async def payment_cancel(request: Request):
    data = await request.json()
    logging.info(f"Payment cancel webhook: {data}")
    # TODO: Ghi log hoặc xử lý khi user hủy thanh toán
    return {"message": "Payment cancel received"}
