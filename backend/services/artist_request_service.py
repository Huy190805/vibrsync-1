# ArtistRequestService.py
from models.artist_request import ArtistRequestCreate, ArtistRequestInDB
from database.repositories.artist_request_repository import ArtistRequestRepository
from database.repositories.artist_repository import ArtistRepository
from database.repositories.user_repository import UserRepository
from datetime import datetime
from fastapi import HTTPException
from typing import List,Optional
from auth import create_access_token
from utils.text_matcher import fuzzy_match_artist_name

class ArtistRequestService:
    def __init__(self):
        self.repo = ArtistRequestRepository()
        self.artist_repo = ArtistRepository()
        self.user_repo = UserRepository()

    def create_request(self, request_data: dict) -> str:
        # 1. Check nếu user đã gửi request
        if self.repo.find_by_user_id(request_data["user_id"]):
            raise HTTPException(status_code=400, detail="Artist request already exists")

        # 2. Tìm nghệ sĩ tương tự để gợi ý merge
        similar_artists = self.artist_repo.get_similar_artists(request_data["name"])
        matched_name = fuzzy_match_artist_name(request_data["name"], [a["name"] for a in similar_artists])
        
        if matched_name:
            matched_artist = next((a for a in similar_artists if a["name"] == matched_name), None)
            if matched_artist:
                request_data["matched_artist_id"] = str(matched_artist["_id"])  # => Sẽ lưu để admin có thể merge

        # 3. Chuẩn hoá dữ liệu và lưu
        request_data["phone"] = request_data.get("phone", "")
        request_data["social_links"] = [str(link) for link in request_data.get("social_links", [])]
        request_data["status"] = "pending"
        request_data["created_at"] = datetime.utcnow()
        request_data["updated_at"] = datetime.utcnow()

        return self.repo.create(request_data)

    def get_request_by_id(self, request_id: str) -> ArtistRequestInDB:
        request = self.repo.find_by_id(request_id)
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        request["id"] = str(request["_id"])
        del request["_id"]
        return ArtistRequestInDB(**request)

    def get_requests(self, status: str = None) -> List[ArtistRequestInDB]:
        requests = self.repo.find_all(status)
        for req in requests:
            user = self.user_repo.find_by_id(req["user_id"])
            req["email"] = user["email"] if user else "N/A"
            req["id"] = str(req["_id"])
            del req["_id"]
        return [ArtistRequestInDB(**req) for req in requests]

    def approve_request(self, request_id: str, matched_artist_id: Optional[str] = None) -> dict:
        request = self.repo.find_by_id(request_id)
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        if request["status"] != "pending":
            raise HTTPException(status_code=400, detail="Request already processed")
        
          # Nếu merge vào nghệ sĩ đã có
        if matched_artist_id:
            artist_id = matched_artist_id

         # ⚠️ Update artist hiện tại để đánh dấu người đã claim
            self.artist_repo.update(matched_artist_id, {
                "claimed_by_user_id": request["user_id"]
            })
        else:
         # ⚠️ Tạo artist mới, nhớ set các trường đặc biệt
            artist_dict = {
                "name": request["name"],
                "bio": request.get("bio", ""),
                "phone": request.get("phone", ""),
                "image": request.get("image", ""),
                "genres": request.get("genres", []),
                "followers": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "created_by_admin": False,                         
                "claimed_by_user_id": request["user_id"]           
            }
            artist_id = self.artist_repo.insert_one(artist_dict).inserted_id

        # Cập nhật user
        self.user_repo.update(request["user_id"], {
            "role": "artist",
            "artist_id": str(artist_id),
            "verified": True
        })

       # Update trạng thái request
        self.repo.update(request_id, {"status": "approved", "updated_at": datetime.utcnow()})

       # Tạo token mới cho user
        new_token = create_access_token({"sub": request["user_id"]})
        return {
            "message": "Artist request approved",
            "access_token": new_token
        }

    def reject_request(self, request_id: str) -> dict:
        request = self.repo.find_by_id(request_id)
        if not request:
           raise HTTPException(status_code=404, detail="Request not found")
        if request["status"] != "pending":
           raise HTTPException(status_code=400, detail="Request already processed")
        if not self.repo.delete(request_id):
           raise HTTPException(status_code=500, detail="Failed to delete request")
        return {"message": "Artist request rejected and deleted"}
