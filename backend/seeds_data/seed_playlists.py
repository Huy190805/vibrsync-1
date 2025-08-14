# seed_playlists.py
from database.db import playlists_collection, songs_collection
from bson import ObjectId

def seed_playlists():
    playlists_collection.delete_many({})

    # Lấy danh sách bài hát để lấy _id
    songs = list(songs_collection.find().limit(2))  # Lấy 2 bài hát đầu
    if len(songs) < 2:
        print("❌ Not enough songs to create playlist")
        return

    song_id_1 = str(songs[0]["_id"])
    song_id_2 = str(songs[1]["_id"])

    playlists = [
        {
            "_id": "playlist_1",
            "title": "Top Hits 2023",
            "slug": "top-hits-2023",
            "description": "The best hits of 2023",
            "creator": "VibeSync",
            "coverArt": "/save-your-tears-album-cover.png",
            "songIds": [song_id_1, song_id_2]
        },
        {
            "_id": "liked",
            "title": "Liked Songs",
            "slug": "liked",
            "description": "Your liked songs",
            "creator": "VibeSync",
            "coverArt": "/liked.png",
            "songIds": [song_id_2]
        }
    ]

    playlists_collection.insert_many(playlists)
    print("✅ Playlists seeded with valid songIds")

if __name__ == "__main__":
    seed_playlists()
