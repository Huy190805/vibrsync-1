from database.repositories.artist_repository import ArtistRepository
from database.repositories.song_repository import SongRepository
from database.repositories.album_repository import AlbumRepository
from bson import ObjectId
from models.artist import ArtistUpdate
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from datetime import datetime

from services.follow_service import FollowService  # ✅ IMPORT

class ArtistProfileService:
    def __init__(self):
        self.artist_repo = ArtistRepository()
        self.song_repo = SongRepository()
        self.album_repo = AlbumRepository()
        self.follow_service = FollowService()  # ✅ KHAI BÁO

    def get_artist_profile(self, artist_id: str):

        try:
            artist = self.artist_repo.find_by_id(ObjectId(artist_id))
        except Exception as e:
            print(f"❌ Invalid artist_id: {e}")
            raise HTTPException(status_code=400, detail="Invalid artist ID")

        if not artist:
            print("❌ Artist not found.")
            raise HTTPException(status_code=404, detail="Artist not found")

        artist["artist_id"] = str(artist["_id"])
        del artist["_id"]

        # ✅ Lấy số lượng người theo dõi
        try:
            followers = self.follow_service.count_followers(artist_id)
        except Exception as e:
            print(f"❌ Error counting followers: {e}")
            followers = 0

        # ✅ Lấy bài hát
        try:
            query = {
                "$or": [
                    {"artistId": ObjectId(artist_id)},
                    {"artistId": str(artist_id)}
                ]
            }
            songs = self.song_repo.find_all(query=query)
        except Exception as e:
            songs = []

        for s in songs:
            s["id"] = str(s.get("_id", ""))
            s["artistId"] = str(s.get("artistId", ""))
            if "albumId" in s and s["albumId"]:
                s["albumId"] = str(s["albumId"])
            del s["_id"]

        # ✅ Lấy album
        try:
            albums = self.album_repo.find_by_artist_id(artist_id)
        except Exception as e:
            albums = []

        for a in albums:
            a["id"] = str(a["_id"])
            a["artistId"] = str(a.get("artistId", ""))
            del a["_id"]

        # ✅ Trả dữ liệu đầy đủ
        response_data = {
            **artist,
            "songs": songs,
            "albums": albums,
            "followers": followers  # ✅ Gắn vào đây
        }

        return JSONResponse(content=jsonable_encoder(response_data))


    def update_artist_profile(self, artist_id: str, update_data: ArtistUpdate):
        try:
            artist = self.artist_repo.find_by_id(ObjectId(artist_id))
        except Exception as e:
            print(f"❌ Invalid artist_id: {e}")
            raise HTTPException(status_code=400, detail="Invalid artist ID")

        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")

        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()

        try:
            self.artist_repo.update_by_id(ObjectId(artist_id), update_dict)
        except Exception as e:
            print(f"❌ Update failed: {e}")
            raise HTTPException(status_code=500, detail="Update failed")

        return JSONResponse(content={"message": "Artist profile updated successfully."})