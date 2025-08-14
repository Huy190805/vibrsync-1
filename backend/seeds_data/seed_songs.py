# seeds_data/seed_songs.py

from database.db import songs_collection, artists_collection
from datetime import datetime, timezone
from seeds_data.seed_artists import seed_artists


# Step 1: Seed nghệ sĩ và lấy mapping name → ObjectId
artist_map = seed_artists()


# Step 3: Chuẩn bị dữ liệu bài hát
now = datetime.now(timezone.utc)

songs = [
    {
        "title": "3107",
        "artist": "ERIK",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 325,
        "genre": ["Sad Music", "V-Pop"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647282/3107_4_tvntdp.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750740/audios/31074.mp3",
        "artistId": artist_map["ERIK"],
        "created_at": now
    },
    {
        "title": "Âm Thầm Bên Êm",
        "artist": "Sơn Tùng MTP",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 328,
        "genre": ["Pop", "Sad Music", "V-Pop"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647282/amThamBenEm_mbgsih.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750746/audios/amThamBenEm.mp3",
        "artistId": artist_map["Đức Phúc"],
        "created_at": now
    },
    {
        "title": "Bài Này Chill Phết",
        "artist": "Đen Vâu",
        "album": "ShowCuaDen",
        "releaseYear": 2024,
        "duration": 353,
        "genre": ["Rap", "Upbeat music", "R&B"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647286/baiNayChillPhet_wzpqat.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750764/audios/baiNayChillPhet.mp3",
        "artistId": artist_map["Đen Vâu"],
        "created_at": now
    },
    {
        "title": "Cũng Đành Thôi",
        "artist": "Đức Phúc",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 405,
        "genre": ["Electronic"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647287/cungDanhThoi_l1jjso.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750800/audios/cungDanhThoi.mp3",
        "artistId": artist_map["Đức Phúc"],
        "created_at": now
    },
    {
        "title": "Ánh Mắt Biết Cười",
        "artist": "Tăng Duy Tân",
        "album": "Anh Trai Say Hi",
        "releaseYear": 2024,
        "duration": 432,
        "genre": [ "Rap", "V-Pop"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647283/anhMatBietCuoi_tk2qde.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750342578/audios/anhMatBietCuoi.mp3",
        "artistId": artist_map["Tăng Duy Tân"],
        "created_at": now
    },
    {
        "title": "Cắt Đôi Nỗi Sầu",
        "artist": "ATUS",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 419,
        "genre": ["Chill", "Ballad", "V-Pop"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647286/catDoiNoiSau_ph0imw.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750778/audios/catDoiNoiSau.mp3",
        "artistId": artist_map["ATUS"],
        "created_at": now
    },
    {
        "title": "Nỗi Đau Đính Kèm",
        "artist": "ATUS",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 407,
        "genre": ["Acoustic"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647267/noiDauDinhKem_sdiqrz.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750857/audios/noiDauDinhKem.mp3",
        "artistId": artist_map["ATUS"],
        "created_at": now
    },
    {
        "title": "Bật Tình Yêu Lên",
        "artist": "Tuấn Cry",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 314,
        "genre": ["R&B", "V-Pop", "Dance-Pop"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647286/batTinhYeuLen_aqhgkk.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750771/audios/batTinhYeuLen.mp3",
        "artistId": artist_map["Tuấn Cry"],
        "created_at": now
    },
    {
        "title": "Muộn Rồi Mà Sao Còn",
        "artist": "Sơn Tùng MTP",
        "album": "Single",
        "releaseYear": 2024,
        "duration": 210,
        "genre": ["HipHop", "V-Pop", "R&B"],
        "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647262/muonRoiMaSaoCon_kvsgz4.jpg",
        "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750849/audios/muonRoiMaSaoCon.mp3",
        "artistId": artist_map["Sơn Tùng MTP"],
        "created_at": now
    },
    {
    "title": "Đi Về Nhà",
    "artist": "Đen Vâu",
    "album": "ShowCuaDen",
    "releaseYear": 2024,
    "duration": 240,
    "genre": ["Hip-Hop", "Rap"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647290/diVeNha_rawgtu.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750900/audios/diVeNha.mp3",
    "artistId": artist_map["Đen Vâu"],
    "created_at": now
},
{
    "title": "Ngáo Ngơ",
    "artist": "HieuThuHai",
    "album": "Anh Trai Say Hi",
    "releaseYear": 2024,
    "duration": 210,
    "genre": ["Hip-Hop"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647262/ngaoNg%C6%A1_xvi1lj.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750901/audios/ngaoNgo.mp3",
    "artistId": artist_map["HieuThuHai"],
    "created_at": now
},
{
    "title": "Ngày Đầu Tiên",
    "artist": "Đức Phúc",
    "album": "Đức Phúc Hit Collection",
    "releaseYear": 2024,
    "duration": 265,
    "genre": ["Pop"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647263/ngayDauTien_aveknh.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750902/audios/ngayDauTien.mp3",
    "artistId": artist_map["Đức Phúc"],
    "created_at": now
},
{
    "title": "Dù Cho Tận Thế",
    "artist": "ERIK",
    "album": "ERIK Best Hits",
    "releaseYear": 2024,
    "duration": 260,
    "genre": ["Pop"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647290/duChoTanThe_rqtst5.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750903/audios/duChoTanThe.mp3",
    "artistId": artist_map["ERIK"],
    "created_at": now
},
{
    "title": "Bắc Bling",
    "artist": "Hòa Minzy",
    "album": "Hòa Minzy Singles",
    "releaseYear": 2024,
    "duration": 230,
    "genre": ["Ballad"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647285/bacBling_iibwiv.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750904/audios/bacBling.mp3",
    "artistId": artist_map["Hòa Minzy"],
    "created_at": now
},
{
    "title": "Lời Tạm Biệt Chưa Nói",
    "artist": "Kai Đinh",
    "album": "Kai Đinh Indie Mix",
    "releaseYear": 2024,
    "duration": 290,
    "genre": ["Indie"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647262/loiTamBietChuaNoi_b8de78.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750905/audios/loiTamBietChuaNoi.mp3",
    "artistId": artist_map["Kai Đinh"],
    "created_at": now
},
{
    "title": "Sài Gòn Hôm Nay Mưa",
    "artist": "Hoàng Duyên",
    "album": "Hoàng Duyên Ballads",
    "releaseYear": 2024,
    "duration": 250,
    "genre": ["Ballad"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647267/saiGonHomNayMua_aezxmi.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750906/audios/saiGonHomNayMua.mp3",
    "artistId": artist_map["Hoàng Duyên"],
    "created_at": now
},
{
    "title": "Trái Đất Ôm Mặt Trời",
    "artist": "Hoàng Thùy Linh",
    "album": "Hoàng Thùy Linh Pop",
    "releaseYear": 2024,
    "duration": 270,
    "genre": ["Pop"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647281/traiDatOmMatTroi_la2xnn.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750907/audios/traiDatOmMatTroi.mp3",
    "artistId": artist_map["Hoàng Thùy Linh"],
    "created_at": now
},
{
    "title": "Yêu Một Người Có Lẽ",
    "artist": "JSOL",
    "album": "JSOL R&B Hits",
    "releaseYear": 2024,
    "duration": 250,
    "genre": ["R&B"],
    "coverArt": "https://res.cloudinary.com/dhifiomji/image/upload/v1750647281/yeuMotNguoiCoLe_vvbgzk.jpg",
    "audioUrl": "https://res.cloudinary.com/dhifiomji/raw/upload/v1750750908/audios/yeuMotNguoiCoLe.mp3",
    "artistId": artist_map["JSOL"],
    "created_at": now
}

    
]

# Step 4: Seed songs
songs_collection.delete_many({})
inserted = songs_collection.insert_many(songs)
song_ids = inserted.inserted_ids
song_map = {song["title"]: song_id for song, song_id in zip(songs, song_ids)}
print(f"✅ Seeded {len(inserted.inserted_ids)} songs successfully.")
