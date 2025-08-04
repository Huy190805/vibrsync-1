import re
import unicodedata
import difflib
from utils.gemini_api import ask_gemini
from services.artist_service import ArtistService
from services.song_service import SongService
from database.repositories.artist_repository import ArtistRepository
from database.repositories.song_repository import SongRepository
from services.album_service import AlbumService
from database.db import songs_collection, artists_collection, albums_collection
from database.repositories.album_repository import AlbumRepository
from services.song_service import SongService
from utils.text_utils import normalize_text


# ======== Chuẩn hóa văn bản ==========
def normalize_text(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)  # bỏ dấu tiếng Việt
    text = re.sub(r'[^\w\s]', '', text)          # bỏ ký tự đặc biệt
    return text.strip()

# ======== Phát hiện ngôn ngữ ==========
def detect_language(text: str) -> str:
    return "en" if re.search(r'[a-zA-Z]', text) and not re.search(r'[à-ỹÀ-Ỹ]', text) else "vi"


def find_best_match(query: str, candidates: list[str]) -> str:
    query_norm = normalize_text(query)
    candidates_norm = [normalize_text(c) for c in candidates]
    matches = difflib.get_close_matches(query_norm, candidates_norm, n=1, cutoff=0.6)
    if matches:
        matched_index = candidates_norm.index(matches[0])
        return candidates[matched_index]  # trả về tên gốc ban đầu
    return None

def search_artist(query: str, all_artists: list[str]):
    best_match = find_best_match(query, all_artists)
    if best_match:
        print(f"Tìm thấy nghệ sĩ gần đúng: {best_match}")
        # Lúc này bạn có thể truy vấn DB bằng best_match
        return best_match
    else:
        print("Không tìm thấy nghệ sĩ phù hợp.")
        return None


# ======== Khởi tạo service ==========
artist_repo = ArtistRepository()
song_repo = SongRepository()
album_repo = AlbumRepository()
artist_service = ArtistService()
song_service = SongService(song_repo, artist_repo)


def handle_user_input(user_input: str):
    query = normalize_text(user_input)

    # 1. Ưu tiên kiểm tra có bài hát nào gần đúng không
    song = song_service.find_song_by_fuzzy_title(query)
    if song:
        return {
            "type": "song",
            "title": song["title"],
            "artist": song["artist"],
            "coverArt": song.get("coverArt", ""),
            "releaseYear": song.get("releaseYear", ""),
            "link": f"/songs/{song['_id']}"
        }

    # 2. (optional) Kiểm tra nghệ sĩ, album, v.v.
    # artist = artist_service.find_artist_by_fuzzy_name(query)
    # if artist:
    #     return ...

    # 3. Fallback gọi Gemini
    return ask_gemini(user_input)



artist_service = ArtistService()

def get_all_artists_simple():
    return artist_service.get_all_artists_simple()


# ======== Lấy dữ liệu từ MongoDB ==========
try:
    ARTISTS_DATA = artist_service.get_all_artists_simple()
except Exception:
    ARTISTS_DATA = []

try:
    SONGS_DATA = song_service.get_all_songs_simple()
except Exception:
    SONGS_DATA = []

# ======== Tạo danh sách tìm kiếm mềm ==========
ARTISTS_DATA = list(artists_collection.find({}))
ARTIST_ENTRIES = [
    {
        "artist_id": str(artist["_id"]),
        "name": artist.get("name", ""),
        "bio": artist.get("bio", ""),
        "genres": artist.get("genres", []),
        "followers": artist.get("followers", 0),
        "normalizedName": artist.get("normalizedName", normalize_text(artist["name"])),
        "url": f"http://localhost:3000/artist/{artist['_id']}",
        "image": artist.get("image", ""),
        "keywords": (
            [normalize_text(artist["name"])] +
            [normalize_text(artist["name"]).replace(" ", "")]
        ),
    }
    for artist in ARTISTS_DATA
]


SONGS_DATA = list(songs_collection.find({}))
SONG_ENTRIES = [
    {
        "type": "song", 
        "song_id": str(song["_id"]),
        "title": song.get("title", ""),
        "artist": song.get("artist", ""),
        "artistId": str(song.get("artistId", "")),
        "album": song.get("album", ""),
        "releaseYear": song.get("releaseYear", ""),
        "duration": song.get("duration", ""),
        "genres": song.get("genre", []),
        "lyrics": song.get("lyrics_lrc", ""),
        "audioUrl": song.get("audioUrl", ""),
        "image": song.get("coverArt", ""),
        "url": f"http://localhost:3000/song/{song['_id']}",
        "keywords": (
            [normalize_text(song["title"])] +
            [normalize_text(song["title"]).replace(" ", "")]
        ),
    }
    for song in SONGS_DATA
]


albums = list(albums_collection.find({}))

ALBUM_ENTRIES = []
for album in albums:
    # Lấy các trường cần thiết
    album_entry = {
        "title": album.get("title", ""),
        "album_id": str(album.get("_id", "")),
        "artist_id": str(album.get("artist_id", "")),  # QUAN TRỌNG
        "release_year": album.get("release_year", ""),
        "cover_image": album.get("cover_image", ""),
        "url": f"http://localhost:3000/album/{str(album['_id'])}",
        "keywords": [normalize_text(album.get("title", ""))],
        "image": album.get("cover_image", ""),

    }
    ALBUM_ENTRIES.append(album_entry)



# ======== Câu hỏi định nghĩa sẵn ==========
CUSTOM_RESPONSES = {
    "creator": {
        "questions": [
            "ai tạo ra trang web này", "ai phát triển trang web này",
            "người làm ra trang web này là ai", "ai làm website này",
            "ai là lập trình viên", "developer là ai", "dev là ai"
        ],
        "answer_vi": "🧑‍💻 Website này được phát triển bởi đội ngũ VibeSync – đam mê âm nhạc và công nghệ.",
        "answer_en": "🧑‍💻 This website was developed by the VibeSync team – passionate about music and technology.",
    },
    "purpose": {
        "questions": [
            "trang web này dùng để làm gì", "mục đích của trang web này là gì",
            "website này dùng để làm gì", "tôi vào trang web này để làm gì",
            "chức năng của trang web", "trang web hoạt động thế nào"
        ],
        "answer_vi": "🎧 VibeSync là nền tảng nghe nhạc thông minh, nơi bạn có thể tìm kiếm, nghe và khám phá playlist theo tâm trạng.",
        "answer_en": "🎧 VibeSync is a smart music platform where you can search, listen, and explore playlists based on your mood.",
    },
    "register": {
        "questions": [
            "làm sao để đăng ký tài khoản", "cách đăng ký tài khoản", "tôi muốn tạo tài khoản",
            "đăng ký như thế nào", "đăng kí như thế nào", "đăng kí thế nào",
            "hướng dẫn đăng ký", "đăng ký ở đâu"
        ],
        "answer_vi": "🔐 Bạn có thể tạo tài khoản bằng cách nhấn vào nút 'Đăng ký' ở góc trên cùng bên phải, sau đó điền thông tin.",
        "answer_en": "🔐 You can create an account by clicking the 'Sign Up' button at the top right and filling in your details.",
    },
    "free_music": {
        "questions": [
            "tôi có thể nghe nhạc miễn phí không", "nghe nhạc có mất phí không",
            "website có miễn phí không", "nghe nhạc free không",
            "nghe nhạc không tốn tiền không", "có trả phí không"
        ],
        "answer_vi": "✅ Hoàn toàn có thể! Tất cả playlist cơ bản đều miễn phí, không cần trả phí.",
        "answer_en": "✅ Yes! All basic playlists are free, no subscription required.",
    },
}


# ========== HÀM XỬ LÝ CHÍNH ==========

async def handle_user_question(prompt: str) -> str:
    norm_prompt = normalize_text(prompt)
    language = detect_language(prompt)

    # 1. Trả lời nhanh theo câu hỏi định nghĩa
    for group in CUSTOM_RESPONSES.values():
        for question in group["questions"]:
            if normalize_text(question) in norm_prompt:
                return group["answer_vi"] if language == "vi" else group["answer_en"]

   
    
    # 3. Enrich prompt nếu quá ngắn
    # ===== Enrich nếu đầu vào không chứa từ khóa nhạc =====
    MUSIC_KEYWORDS = [normalize_text(w) for w in ["bài hát", "ca sĩ", "nhạc", "nghệ sĩ", "album", "song", "artist", "music"]]
    if not any(word in normalize_text(prompt) for word in MUSIC_KEYWORDS):
        enriched_prompt = f"bài hát {prompt}" if language == "vi" else f"song {prompt}"
        norm_prompt = normalize_text(enriched_prompt)
    else:
        enriched_prompt = prompt
        norm_prompt = normalize_text(prompt)


    # 4. Xác định loại câu hỏi: bài hát / nghệ sĩ / album
    if any(key in norm_prompt for key in ["album", "list", "những", "nhiều bài", "nhiều", "tên album"]):
        search_entries = ALBUM_ENTRIES
    else:
        search_entries = ARTIST_ENTRIES + SONG_ENTRIES


    # 5. So khớp gần đúng
    def get_similarity(a, b):
        if b in a or a in b:
            return 1.0
        return difflib.SequenceMatcher(None, a, b).ratio()

    best_entry = None
    best_score = 0.0

    for entry in search_entries:
        for keyword in entry["keywords"]:
            score = get_similarity(norm_prompt, keyword)
            if score > best_score:
                best_score = score
                best_entry = entry

    # 6. Nếu khớp dữ liệu nghệ sĩ, bài hát, hoặc album
    if best_entry and best_score >= 0.6:
        print(f"[DEBUG] best_entry = {best_entry}, score = {best_score}")

        name = best_entry.get("name") or best_entry.get("title")
        extra_info = ""

        if "bio" in best_entry:  # Nghệ sĩ
            artist_name = best_entry["name"]
            artist_bio = best_entry.get("bio", "").strip()
            artist_image = best_entry.get("image", "")
            artist_url = best_entry.get("url", "")
            artist_id = best_entry.get("artist_id", "")

            # Từ khóa thể hiện ý muốn nghe danh sách bài hát
            song_keywords = ["danh sách", "những bài", "list", "nhiều bài", "playlist", "các bài", "nghe nhạc"]
            # Ví dụ trong phần if "bio" in best_entry:
            is_asking_for_songs = any(kw in prompt.lower() for kw in song_keywords)


            # ✅ Nếu người dùng hỏi về danh sách bài hát → không cần hỏi Gemini
            if is_asking_for_songs:
                reply_text = (
                    f"Dưới đây là danh sách một số bài hát nổi bật của nghệ sĩ {artist_name}:"
                    if language == "vi" else
                    f"Here are some featured songs by artist {artist_name}:"
                )
            else:
                # Prompt cho Gemini
                extra_info = (
                    f"Giới thiệu 1 đoạn ngắn về nghệ sĩ {artist_name}.\nĐây là mô tả của họ: {artist_bio}"
                    if language == "vi" and artist_bio else
                    f"Giới thiệu 1 đoạn ngắn về nghệ sĩ {artist_name}."
                    if language == "vi" else
                    f"Introduce the artist {artist_name}.\nHere is their bio: {artist_bio}"
                    if artist_bio else
                    f"Introduce the artist {artist_name}."
                )
                try:
                    reply_text = await ask_gemini(extra_info)
                except Exception:
                    reply_text = extra_info  # fallback nếu lỗi Gemini

            # Bắt đầu khởi tạo phần trả lời
            reply = ""

            if artist_image:
                reply += f"![Ảnh nghệ sĩ]({artist_image})\n\n"

            reply += reply_text

            if artist_url:
                reply += (
                    f"\n\n👉 Bạn có thể xem thêm về nghệ sĩ: [{artist_name}]({artist_url})"
                    if language == "vi" else
                    f"\n\n👉 Learn more about the artist: [{artist_name}]({artist_url})"
                )

            # ✅ Luôn tìm danh sách bài hát dù câu hỏi là gì
            songs_by_artist = [
                s for s in SONG_ENTRIES
                if s["artist"].lower() == artist_name.lower() or s.get("artistId", "") == artist_id
            ]
            if songs_by_artist:
                reply += "\n\n🎵 " + ("Một số bài hát nổi bật:" if language == "vi" else "Some featured songs:") + "\n"
                for s in songs_by_artist[:5]:  # giới hạn 5 bài
                    reply += f"- [{s['title']}]({s['url']})\n"

            return reply


        

        

        elif best_entry.get("type") == "song":  # song
            song_title = best_entry.get("title", "bài hát không rõ")
            artist_name = best_entry.get("artist", "").strip()
            release_year = best_entry.get("releaseYear", "")
            song_id = best_entry.get("song_id", "")
            artist_bio = ""

            # Tìm tiểu sử nghệ sĩ nếu có
            for a in ARTISTS_DATA:
                if a["name"].lower() == artist_name.lower() or str(a["_id"]) == best_entry.get("artistId", ""):
                    artist_bio = a.get("bio", "").strip()
                    break

            # Cắt tiểu sử nếu quá dài
            if artist_bio:
                artist_bio = artist_bio[:400]

            # Prompt cho Gemini
            if artist_name:
                if artist_bio:
                    extra_info = (
                        f"Hãy giới thiệu ngắn bài hát '{song_title}' của ca sĩ {artist_name} phát hành năm {release_year}.\n"
                        f"Thông tin nghệ sĩ: {artist_bio}"
                        if language == "vi" else
                        f"Describe the song '{song_title}' by artist {artist_name}, released in {release_year}.\n"
                        f"Artist bio: {artist_bio}"
                    )
                else:
                    extra_info = (
                        f"Hãy giới thiệu ngắn bài hát '{song_title}' của ca sĩ {artist_name} phát hành năm {release_year}."
                        if language == "vi" else
                        f"Describe the song '{song_title}' by artist {artist_name}, released in {release_year}."
                    )
            else:
                extra_info = (
                    f"Hãy mô tả ngắn bài hát '{song_title}'."
                    if language == "vi" else
                    f"Describe the song '{song_title}'."
                )

            # Gọi Gemini
            try:
                reply = await ask_gemini(extra_info)
            except Exception:
                reply = extra_info

            # Trả về phần markdown
            response = ""

            if best_entry.get("image"):
                response += f"![Ảnh bài hát]({best_entry['image']})\n\n"

            response += reply

            if song_id:
                response += (
                    f"\n\n👉 Nghe bài hát: [{song_title}](http://localhost:3000/song/{song_id})"
                    if language == "vi" else
                    f"\n\n👉 Listen to the song: [{song_title}](http://localhost:3000/song/{song_id})"
                )

            return response


        elif "album_id" in best_entry:  # Album
            album_title = best_entry.get("title", "album không rõ")
            release_year = best_entry.get("release_year", "")
            artist_id = best_entry.get("artist_id", "")
            
            # Tìm tên nghệ sĩ
            artist_name = ""
            for artist in ARTISTS_DATA:
                if str(artist["_id"]) == artist_id:
                    artist_name = artist["name"]
                    break

            # Tạo prompt enrich
            extra_info = (
                f"Hãy giới thiệu về album '{album_title}' của ca sĩ {artist_name} phát hành năm {release_year}."
                if language == "vi" else
                f"Tell me about the album '{album_title}' by artist {artist_name}, released in {release_year}."
            )

            enriched_prompt = extra_info

            try:
                reply = await ask_gemini(enriched_prompt)
            except Exception as e:
                print("Gemini error:", e)
                reply = (
                    f"Album **{album_title}** của ca sĩ **{artist_name}** phát hành năm {release_year}."
                    if language == "vi" else
                    f"The album **{album_title}** by artist **{artist_name}**, released in {release_year}."
                )

            # Chèn ảnh album nếu có
            if best_entry.get("image"):
                reply = f"![Ảnh album]({best_entry['image']})\n\n" + reply

            # Chèn link xem album nếu có
            reply += (
                f"\n\n👉 Bạn có thể xem thêm về album: [{album_title}]({best_entry['url']})"
                if language == "vi" else
                f"\n\n👉 You can learn more about the album: [{album_title}]({best_entry['url']})"
            )

            return reply


