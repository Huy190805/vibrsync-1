from typing import Callable, Dict, Any
from models.song import SongInDB


def get_region_filter(region: str) -> Callable[[SongInDB], bool]:
    """
    Trả về hàm filter dựa trên vùng miền (region): 'vietnamese' hoặc 'international'.
    Dùng cho lọc phía Python (khi dữ liệu đã được lấy từ DB).
    """
    def vietnamese_filter(song: SongInDB):
        return song.genre and any("vietnamese" in g.lower() for g in song.genre)

    def international_filter(song: SongInDB):
        return not (song.genre and any("vietnamese" in g.lower() for g in song.genre))

    if region == "vietnamese":
        return vietnamese_filter
    elif region == "international":
        return international_filter
    else:
        return lambda song: True  # Không lọc nếu không có region


def get_region_query(region: str) -> Dict[str, Any]:
    """
    Trả về truy vấn MongoDB để lọc dữ liệu theo vùng miền.
    Dùng để lọc dữ liệu ngay trong truy vấn tới MongoDB (tối ưu hóa hiệu năng).
    """
    if region == "vietnamese":
        # Lọc các bài hát có genre kết thúc bằng "vietnamese"
        return {"genre": {"$elemMatch": {"$regex": "vietnamese$", "$options": "i"}}}
    elif region == "international":
        # Lọc các bài hát không chứa "vietnamese" trong genre
        return {
            "$or": [
                {"genre": {"$exists": False}},
                {"genre": {"$not": {"$elemMatch": {"$regex": "vietnamese$", "$options": "i"}}}},
            ]
        }
    else:
        return {}  # Không lọc nếu không có region
