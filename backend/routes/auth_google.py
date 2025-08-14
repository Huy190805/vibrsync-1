from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from dotenv import load_dotenv
from services.user_service import UserService
from auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import os
import jwt

load_dotenv()

router = APIRouter()

config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/login/google")
async def login_via_google(request: Request):
    redirect_uri = os.getenv("REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)

    resp = await oauth.google.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        token=token
    )
    user_info = resp.json()

    email = user_info["email"]
    name = user_info.get("name", "")
    avatar = user_info.get("picture", "")

    # Kiểm tra user có tồn tại không
    user = UserService.get_user_by_email(email)
    if not user:
        user_id = UserService.create_user_google(name, email, avatar)
        user = UserService.get_user_by_id(user_id)

    # Tạo access token từ user đã xác nhận
    access_token = create_access_token(
        data={
            "sub": user.id,
            "role": user.role,
            "artist_id": user.artist_id
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return RedirectResponse(f"http://localhost:3000/oauth/callback?token={access_token}")


