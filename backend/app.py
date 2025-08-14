from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import song_routes, user_routes, playlist_routes, albums_routes, artist_routes,history_songs_routes,chat_routes,recomment_routes
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from routes.auth_google import router as google_oauth_router
from routes.webhook import router as webhook_router
from routes.payment_routes import router as payment_router
from routes.admin_routes.song_admin_routes import router as admin_song_router
from routes.admin_routes.admin_artist_routes import router as admin_artist_router
from routes.admin_routes.admin_album_routes import router as admin_album_router
from routes.admin_routes.admin_follow_routes import router as admin_follow_router
from routes.admin_routes.admin_listen_routes import router as admin_listen_router
from routes.admin_routes.admin_like_routes import router as admin_like_router
from routes.admin_routes.admin_playlist_routes import router as admin_playlist_router

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

load_dotenv()
app = FastAPI()

app.mount("/audio", StaticFiles(directory="audio"), name="audio")
app.include_router(webhook_router)
app.include_router(payment_router)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "488464644644")
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(google_oauth_router)
app.include_router(song_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/user")
app.include_router(chat_routes.router)
app.include_router(recomment_routes.router, prefix="/api")
app.include_router(history_songs_routes.router)
app.include_router(listen_router)
app.include_router(playlist_routes.router, prefix="/api")
app.include_router(admin_artist_router, prefix="/api")
app.include_router(albums_routes.router, prefix="/api")
app.include_router(admin_song_router, prefix="/api")
app.include_router(artist_routes.router, prefix="/api")
app.include_router(admin_album_router, prefix="/api")
app.include_router(admin_follow_router, prefix="/api")
app.include_router(admin_listen_router, prefix="/api")
app.include_router(admin_like_router, prefix="/api")
app.include_router(admin_playlist_router, prefix="/api")

app.include_router(artist_request_router)
app.include_router(search_routes, prefix="/api")
app.include_router(notifications_routes.router)
app.include_router(likes_router, prefix="/api")

app.include_router(artist_profile_router, prefix="/api")
app.include_router(artist_song_router, prefix="/api")
app.include_router(artist_album_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "VibeSync API is running"}
