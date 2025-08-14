from database.db import artists_collection
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from cloudinary import config as cloudinary_config

# Tải biến môi trường từ .env
load_dotenv()

# Cấu hình Cloudinary
cloudinary_config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dhifiomji"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "467596386185684"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "cN3IFilAA5xzMMzi_AeLgoHRLBs")
)

# Danh sách nghệ sĩ Việt Nam để seed
artists = [
    {
        "name": "Đen Vâu",
        "bio": "Rapper nổi bật với lời ca giàu chất thơ và thông điệp ý nghĩa.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472836/images/Den-%20Vau.jpg",
        "genres": ["Hip-Hop", "Rap", "V-Pop"],
        "followers": 2000000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Đức Phúc",
        "bio": "Ca sĩ với giọng hát truyền cảm, quán quân The Voice Vietnam.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472837/images/Duc-%20Phuc.jpg",
        "genres": ["Pop", "Ballad", "V-Pop"],
        "followers": 1000000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "ERIK",
        "bio": "Ca sĩ trẻ với các bản hit V-Pop ngọt ngào và phong cách hiện đại.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472838/images/ERIK.jpg",
        "genres": ["Pop", "V-Pop", "R&B"],
        "followers": 800000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Grey D",
        "bio": "Ca sĩ, nhạc sĩ trẻ với phong cách âm nhạc dịu dàng, sâu lắng.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472839/images/Grey-%20D.jpg",
        "genres": ["Pop", "Ballad", "V-Pop"],
        "followers": 300000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "HieuThuHai",
        "bio": "Rapper nổi bật với phong cách trẻ trung và năng động.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472840/images/HieuThu-%20Hai.jpg",
        "genres": ["Hip-Hop", "Rap", "V-Pop"],
        "followers": 400000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Hòa Minzy",
        "bio": "Ca sĩ với giọng hát nội lực và phong cách biểu diễn cuốn hút.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472841/images/Hoa-%20Minzy.jpg",
        "genres": ["Pop", "Ballad", "V-Pop"],
        "followers": 1200000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Hoàng Duyên",
        "bio": "Ca sĩ trẻ với các bản ballad nhẹ nhàng và đầy cảm xúc.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472842/images/Hoang-%20Duyen.jpg",
        "genres": ["Ballad", "V-Pop", "Indie"],
        "followers": 250000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Hoàng Thùy Linh",
        "bio": "Ca sĩ kết hợp âm nhạc hiện đại với yếu tố văn hóa Việt Nam.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472843/images/HoangThuy-%20Linh.jpg",
        "genres": ["Pop", "V-Pop", "Electronic"],
        "followers": 1500000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "JSOL",
        "bio": "Ca sĩ trẻ với phong cách âm nhạc tươi sáng và hiện đại.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472843/images/JSOL.jpg",
        "genres": ["Pop", "V-Pop", "R&B"],
        "followers": 350000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Kai Đinh",
        "bio": "Nhạc sĩ, ca sĩ với các ca khúc indie và ballad sâu lắng.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472844/images/Kai-%20Dinh.jpg",
        "genres": ["Indie", "Ballad", "V-Pop"],
        "followers": 200000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "name": "Lou Hoàng",
        "bio": "Ca sĩ với các bản hit V-Pop trẻ trung và sôi động.",
        "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472846/images/Lou-%20Hoang.jpg",
        "genres": ["Pop", "V-Pop", "R&B"],
        "followers": 600000,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
            {
            "name": "Tuấn Cry",
            "bio": "ehhe",
            "genres": ["V-Pop"],
            "followers": 4667,
            "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472852/images/T…",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "name": "Sơn Tùng MTP",
            "bio": "ehhđjd",
            "genres": ["V-Pop"],
            "followers": 533738,
            "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472850/images/S…",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "name": "ATUS",
            "bio": "dgdjdjd",
            "genres": ["Pop"],
            "followers": 7444884,
            "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472835/images/A…",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
        {
            "name": "Tăng Duy Tân",
            "bio": "dhdhdhhd",
            "genres": ["Rap"],
            "followers": 464748,
            "image": "https://res.cloudinary.com/dhifiomji/image/upload/v1750472851/images/T…",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        },
]

def seed_artists():
    try:
        # Xóa dữ liệu cũ
        artists_collection.delete_many({})

        # Thêm dữ liệu mới
        inserted_artists = artists_collection.insert_many(artists)
        artist_ids = inserted_artists.inserted_ids

        # Ghép tên nghệ sĩ với ObjectId đã insert
        artist_map = {artist["name"]: artist_id for artist, artist_id in zip(artists, artist_ids)}

        print(f"✅ Seeded {len(artist_ids)} artists successfully.")
        return artist_map

    except Exception as e:
        print(f"❌ Failed to seed artists: {str(e)}")
        return {}
