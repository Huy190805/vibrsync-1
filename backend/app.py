from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import song_routes, user_routes, playlist_routes, albums_routes, artist_routes,history_songs_routes,chat_routes,recomment_routes
from fastapi.staticfiles import StaticFiles
from routes.admin_routes.song_admin_routes import router as admin_song_router
from routes.admin_routes.admin_artist_routes import router as admin_artist_router
from routes.admin_routes.admin_album_routes import router as admin_album_router
from routes.admin_routes.admin_follow_routes import router as admin_follow_router
from routes.admin_routes.admin_listen_routes import router as admin_listen_router
from routes.artist_request_routes import router as artist_request_router
from dotenv import load_dotenv
from routes.master_artist_routes.artist_profile_routes import router as artist_profile_router
from routes.master_artist_routes.artist_song_routes import router as artist_song_router
from routes.master_artist_routes.artist_album_routes import router as artist_album_router
from routes import notifications_routes
from routes.search_routes import router as search_routes
from routes.listen_routes import router as listen_router
from routes.likes import router as likes_router
import os

# Optional routes (tồn tại ở nhánh quoc2210)
try:
    from routes import top100_routes
except Exception:
    top100_routes = None

try:
    from routes import recommended_routes
except Exception:
    recommended_routes = None

load_dotenv()

# === Initialize FastAPI ===
app = FastAPI(title="VibeSync API")

app.mount("/audio", StaticFiles(directory="audio"), name="audio")

# === CORS setup ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Include routers ===
# Public APIs
app.include_router(song_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/user")
app.include_router(chat_routes.router)
app.include_router(recomment_routes.router, prefix="/api")
app.include_router(history_songs_routes.router)
app.include_router(listen_router)
app.include_router(playlist_routes.router, prefix="/api")
app.include_router(albums_routes.router, prefix="/api")
app.include_router(artist_routes.router, prefix="/api")
app.include_router(notifications_routes.router)
app.include_router(search_routes, prefix="/api")
app.include_router(likes_router, prefix="/api")

# Optional modules
if top100_routes:
    app.include_router(top100_routes.router, prefix="/api")
if recommended_routes:
    app.include_router(recommended_routes.router, prefix="/api")

# Admin APIs
app.include_router(admin_song_router, prefix="/api")
app.include_router(admin_artist_router, prefix="/api")
app.include_router(admin_album_router, prefix="/api")
app.include_router(admin_follow_router, prefix="/api")
app.include_router(admin_listen_router, prefix="/api")

# Artist management APIs
app.include_router(artist_request_router)
app.include_router(artist_profile_router, prefix="/api")
app.include_router(artist_song_router, prefix="/api")
app.include_router(artist_album_router, prefix="/api")

# === Root endpoint ===
@app.get("/")
def root():
    return {"message": "🎵 VibeSync API is running on FastAPI!"}