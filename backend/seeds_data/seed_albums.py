from database.db import albums_collection
from datetime import datetime, timezone
from seeds_data.seed_artists import seed_artists
from seeds_data.seed_songs import song_map  

# Step 1: Đảm bảo nghệ sĩ và bài hát đã được seed
artist_map = seed_artists()
print("[✅ DEBUG] artist_map:", artist_map)

# Step 2: Xóa dữ liệu cũ trong albums_collection
albums_collection.delete_many({})

# Step 3: Chuẩn bị dữ liệu album
now = datetime.now(timezone.utc)

albums = [
    {
        "title": "ShowCuaDen",
        "artist_id": artist_map["Đen Vâu"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647290/diVeNha_rawgtu.jpg",
        "release_year": 2024,
        "genre": "Hip-Hop",
        "songs": [str(song_map["Đi Về Nhà"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "Anh Trai Say Hi",
        "artist_id": artist_map["HieuThuHai"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647262/ngaoNg%C6%A1_xvi1lj.jpg",
        "release_year": 2024,
        "genre": "Hip-Hop",
        "songs": [str(song_map["Ngáo Ngơ"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "Đức Phúc Hit Collection",
        "artist_id": artist_map["Đức Phúc"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647263/ngayDauTien_aveknh.jpg",
        "release_year": 2024,
        "genre": "Pop",
        "songs": [str(song_map["Ngày Đầu Tiên"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "ERIK Best Hits",
        "artist_id": artist_map["ERIK"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647290/duChoTanThe_rqtst5.jpg",
        "release_year": 2024,
        "genre": "Pop",
        "songs": [str(song_map["Dù Cho Tận Thế"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "Hòa Minzy Singles",
        "artist_id": artist_map["Hòa Minzy"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647285/bacBling_iibwiv.jpg",
        "release_year": 2024,
        "genre": "Ballad",
        "songs": [str(song_map["Bắc Bling"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "Kai Đinh Indie Mix",
        "artist_id": artist_map["Kai Đinh"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647262/loiTamBietChuaNoi_b8de78.jpg",
        "release_year": 2024,
        "genre": "Indie",
        "songs": [str(song_map["Lời Tạm Biệt Chưa Nói"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "Hoàng Duyên Ballads",
        "artist_id": artist_map["Hoàng Duyên"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647267/saiGonHomNayMua_aezxmi.jpg",
        "release_year": 2024,
        "genre": "Ballad",
        "songs": [str(song_map["Sài Gòn Hôm Nay Mưa"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "Hoàng Thùy Linh Pop",
        "artist_id": artist_map["Hoàng Thùy Linh"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647281/traiDatOmMatTroi_la2xnn.jpg",
        "release_year": 2024,
        "genre": "Pop",
        "songs": [str(song_map["Trái Đất Ôm Mặt Trời"])],
        "created_at": now,
        "updated_at": now
    },
    {
        "title": "JSOL R&B Hits",
        "artist_id": artist_map["JSOL"],
        "cover_art": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647281/yeuMotNguoiCoLe_vvbgzk.jpg",
        "release_year": 2024,
        "genre": "R&B",
        "songs": [str(song_map["Yêu Một Người Có Lẽ"])],
        "created_at": now,
        "updated_at": now
    }
]

# Step 4: Seed albums
inserted_albums = albums_collection.insert_many(albums)
print(f"✅ Seeded {len(inserted_albums.inserted_ids)} albums successfully.")