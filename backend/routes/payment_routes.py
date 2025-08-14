import os
import logging
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Depends
from payos import PayOS, PaymentData
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from dotenv import load_dotenv
from auth import  get_current_admin
from database.db import payment_collection  # đường dẫn tới file db.py chứa kết nối MongoDB

load_dotenv()  # load biến môi trường

logging.basicConfig(level=logging.INFO)

router = APIRouter()

payos_client = PayOS(
    client_id=os.getenv("PAYOS_CLIENT_ID"),
    api_key=os.getenv("PAYOS_API_KEY"),
    checksum_key=os.getenv("PAYOS_CHECKSUM_KEY"),
)

@router.post("/payments")
async def create_payment(request: Request):
    data = await request.json()
    logging.info(f"Received payment data: {data}")

    try:
        # Lấy order_code hoặc tạo mới nếu không có
        order_code = data.get("orderCode")
        if order_code is None:
            order_code = random.randint(1000, 99999)
        else:
            order_code = int(order_code)

        # Lấy amount, ép kiểu int
        amount = int(data.get("amount"))

        # Mô tả tối đa 25 ký tự
        description = (data.get("description") or f"Payment user {data.get('username')}")[:25]

        # Tạo đối tượng PaymentData
        payment_data = PaymentData(
            orderCode=order_code,
            amount=amount,
            description=description,
            returnUrl=os.getenv("RETURN_URL"),
            cancelUrl=os.getenv("CANCEL_URL"),
        )

        # Gọi API tạo payment link
        response = payos_client.createPaymentLink(payment_data)

        # response.to_json() trả về dict rồi, không cần json.loads()
        response_dict = response.to_json()

        # Tạo document lưu vào DB
        payment_doc = {
            "user_id": data.get("user_id"),
            "username": data.get("username"),
            "amount": amount,
            "currency": "USD",
            "method": data.get("method"),
            "plan_type": data.get("plan_type"),
            "duration": data.get("duration"),
            "status": "pending",
            "created_at": datetime.utcnow(),
            "order_code": order_code,
            "checkout_url": response_dict.get("data", {}).get("checkout_url"),
            "payos_response": response_dict,
        }

        # Lưu vào MongoDB
        payment_collection.insert_one(payment_doc)

        # Trả về response dict cho client
        return response_dict

    except Exception as e:
        logging.error(f"Payment creation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

def transform_payment_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

# GET /payments - lấy danh sách payments
@router.get("/payments")
async def get_payments():
    try:
        payments_cursor = payment_collection.find()
        payments_list = list(payments_cursor)
        payments = [transform_payment_doc(p) for p in payments_list]
        return payments
    except Exception as e:
        logging.error(f"Failed to get payments: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get payments: {str(e)}")

# POST /payments - tạo payment (bạn có thể giữ nếu cần)
@router.post("/payments")
async def create_payment(request: Request):
    # Your create payment logic here...
    pass

# PATCH /api/payments/{payment_id}/status - cập nhật trạng thái
@router.patch("/api/payments/{payment_id}/status")
async def update_payment_status(payment_id: str, status_update: dict, admin=Depends(get_current_admin)):
    new_status = status_update.get("status")
    if new_status not in ("pending", "completed", "canceled"):
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        oid = ObjectId(payment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payment ID")

    result = payment_collection.update_one({"_id": oid}, {"$set": {"status": new_status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")

    updated_payment = payment_collection.find_one({"_id": oid})
    return transform_payment_doc(updated_payment)

# DELETE /api/payments/{payment_id} - xóa payment
@router.delete("/api/payments/{payment_id}")
async def delete_payment(payment_id: str, admin=Depends(get_current_admin)):
    try:
        oid = ObjectId(payment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payment ID")

    result = payment_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {"detail": "Payment deleted successfully"}