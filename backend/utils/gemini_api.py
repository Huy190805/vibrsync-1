import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

# ✅ Kiểm tra API key
if not GEMINI_API_KEY:
    raise ValueError("⚠️ GOOGLE_API_KEY không được tìm thấy trong biến môi trường (.env)")

# URL gọi Gemini 2.5 Flash
GEMINI_API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
)




# ======= Hàm chính hỏi Gemini =======
async def ask_gemini(prompt: str) -> str:
    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    print("🔹 [ask_gemini] Prompt gửi lên Gemini:")
    print(prompt)
    print("🔹 [ask_gemini] Đang gửi yêu cầu đến:", GEMINI_API_URL)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(GEMINI_API_URL, headers=headers, json=body)

            print(f"✅ [ask_gemini] Status code: {response.status_code}")
            response.raise_for_status()

            data = response.json()
            print("✅ [ask_gemini] Phản hồi nhận được:")
            print(data)

            # Lấy phần phản hồi từ candidates
            candidates = data.get("candidates", [])
            if not candidates:
                return "⚠️ Gemini không trả lời được. Vui lòng thử lại."

            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts or "text" not in parts[0]:
                return "⚠️ Gemini không có nội dung phản hồi."

            reply = parts[0]["text"]
            return reply.strip()

    except httpx.HTTPStatusError as e:
        print(f"❌ [ask_gemini] HTTP error: {e.response.status_code} - {e.response.text}")
        return f"⚠️ Lỗi HTTP {e.response.status_code}: {e.response.text}"

    except httpx.RequestError as e:
        print(f"❌ [ask_gemini] Request error (mất kết nối?): {e}")
        return f"⚠️ Không thể kết nối đến Gemini API: {e}"

    except Exception as e:
        print(f"❌ [ask_gemini] Exception khác: {str(e)}")
        return f"⚠️ Lỗi nội bộ khi gửi yêu cầu Gemini: {str(e)}"