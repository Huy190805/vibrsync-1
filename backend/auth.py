from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from services.user_service import UserService
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY must be set in environment variables")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 90

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
        user = UserService.get_user_by_id(user_id)
        if not user:
            raise credentials_exception
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar,
            "banned": user.banned,
            "verified": user.verified,
            "artist_id": getattr(user, "artist_id", None)
        }
    except JWTError:
        raise credentials_exception


async def get_current_admin(token: str = Depends(oauth2_scheme)):
    user = await get_current_user(token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user

async def get_current_artist(token: str = Depends(oauth2_scheme)):
    user = await get_current_user(token)
    if user["role"] != "artist":
        raise HTTPException(status_code=403, detail="Artist access only")
    return user

from fastapi.security import HTTPBearer
from fastapi import Security

bearer_scheme = HTTPBearer(auto_error=False)

async def get_optional_user(token: str = Security(bearer_scheme)):
    if not token:
        return None
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        user = UserService.get_user_by_id(user_id)
        if not user:
            return None
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar,
            "banned": user.banned
        }
    except JWTError:
        return None
