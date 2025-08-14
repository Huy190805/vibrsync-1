import re
import unicodedata
import difflib
import logging
from collections import defaultdict
from typing import List, Optional, Tuple, Dict, Any

from utils.gemini_api import ask_gemini
from services.artist_service import ArtistService
from services.song_service import SongService
from services.album_service import AlbumService
from database.repositories.artist_repository import ArtistRepository
from database.repositories.song_repository import SongRepository
from database.repositories.album_repository import AlbumRepository
from services.search_service import SearchService
from database.db import songs_collection, artists_collection, albums_collection

# Logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

search_service = SearchService()

# Global data entries
ARTIST_ENTRIES = []
SONG_ENTRIES = []
ALBUM_ENTRIES = []

# -------------------------
# Safe service initialization
# -------------------------
def try_init(service_cls, *args):
    """
    Try to instantiate service with provided args; if fails, try without args.
    This avoids TypeError when service constructor signatures differ.
    """
    try:
        return service_cls(*args)
    except TypeError:
        try:
            return service_cls()
        except Exception as e:
            logger.exception(f"Failed to init {service_cls}: {e}")
            return None
    except Exception as e:
        logger.exception(f"Failed to init {service_cls} with args {args}: {e}")
        return None

artist_repo = try_init(ArtistRepository)
song_repo = try_init(SongRepository)
album_repo = try_init(AlbumRepository)

artist_service = try_init(ArtistService, artist_repo) or try_init(ArtistService)
song_service = try_init(SongService, song_repo, artist_repo) or try_init(SongService)
album_service = try_init(AlbumService, album_repo, artist_repo) or try_init(AlbumService)

# -------------------------
# Text normalization helpers
# -------------------------
def normalize_text(text: str) -> str:
    """Lowercase, remove diacritics, keep spaces, remove special chars except spaces."""
    if not text:
        return ""
    s = text.lower()
    s = unicodedata.normalize("NFD", s)
    s = re.sub(r"[\u0300-\u036f]", "", s)  # remove accents
    s = re.sub(r"[^\w\s]", " ", s)  # replace punctuation with space
    s = re.sub(r"\s+", " ", s).strip()
    return s

def normalize_for_match(text: str) -> str:
    """Normalization targeted for fuzzy matching: remove spaces and accents."""
    if not text:
        return ""
    s = unicodedata.normalize("NFD", text.lower())
    s = re.sub(r"[\u0300-\u036f]", "", s)  # remove accents
    s = re.sub(r"[^\w]", "", s)  # remove everything not alphanumeric (remove spaces too)
    return s

def detect_language(text: str) -> str:
    """Simple language detection: if Vietnamese diacritics present -> vi, else if latin letters -> en, else vi."""
    if not text:
        return "vi"
    if re.search(r"[à-ỹÀ-Ỹ]", text):
        return "vi"
    if re.search(r"[a-zA-Z]", text) and not re.search(r"[à-ỹÀ-Ỹ]", text):
        return "en"
    return "vi"

# -------------------------
# Number extraction (digits + Vietnamese words up to 20)
# -------------------------
_NUMBER_WORDS = {
    "một": 1, "mot": 1,
    "hai": 2,
    "ba": 3,
    "bốn": 4, "bon": 4,
    "năm": 5, "nam": 5,
    "sáu": 6, "sau": 6,
    "bảy": 7, "bay": 7,
    "tám": 8, "tam": 8,
    "chín": 9, "chin": 9,
    "mười": 10, "muoi": 10,
    "mười một": 11, "muoi mot": 11,
    "mười hai": 12, "muoi hai": 12,
    "mười ba": 13, "muoi ba": 13,
    "mười bốn": 14, "muoi bon": 14,
    "mười lăm": 15, "muoi lam": 15,
    "mười sáu": 16, "muoi sau": 16,
    "mười bảy": 17, "muoi bay": 17,
    "mười tám": 18, "muoi tam": 18,
    "mười chín": 19, "muoi chin": 19,
    "hai mươi": 20, "hai muoi": 20,
}

def extract_number_from_text(text: str) -> Optional[int]:
    """Extract integer from text: first try digits, then Vietnamese words map."""
    if not text:
        return None
    # digits
    m = re.search(r"(\d+)", text)
    if m:
        try:
            return int(m.group(1))
        except:
            pass
    # words: check for multi-word numbers first
    low = normalize_text(text)
    for word, val in _NUMBER_WORDS.items():
        if word in low:
            return val
    return None

# -------------------------
# Build search entries from DB
# -------------------------
def safe_find_all(collection):
    try:
        return list(collection.find({}))
    except Exception as e:
        logger.exception(f"DB read error: {e}")
        return []

def refresh_data():
    """Refresh ARTIST_ENTRIES, SONG_ENTRIES, and ALBUM_ENTRIES from the database."""
    global ARTIST_ENTRIES, SONG_ENTRIES, ALBUM_ENTRIES

    # Fetch fresh data from database
    ARTISTS_DATA = safe_find_all(artists_collection)
    SONGS_DATA = safe_find_all(songs_collection)
    ALBUMS_DATA = safe_find_all(albums_collection)

    # Rebuild ARTIST_ENTRIES
    ARTIST_ENTRIES = []
    for artist in ARTISTS_DATA:
        name = artist.get("name", "")
        ARTIST_ENTRIES.append({
            "artist_id": str(artist.get("_id", "")),
            "name": name,
            "bio": artist.get("bio", ""),
            "genres": artist.get("genres", []),
            "followers": artist.get("followers", 0),
            "normalizedName": normalize_text(name),
            "matchKey": normalize_for_match(name),
            "url": f"http://localhost:3000/artist/{artist.get('_id')}",
            "image": artist.get("image", ""),
            "keywords": [normalize_text(name), normalize_for_match(name)]
        })

    # Rebuild SONG_ENTRIES
    SONG_ENTRIES = []
    for song in SONGS_DATA:
        title = song.get("title", "")
        SONG_ENTRIES.append({
            "type": "song",
            "song_id": str(song.get("_id", "")),
            "title": title,
            "matchKey": normalize_for_match(title),
            "titleNorm": normalize_text(title),
            "artist": song.get("artist", ""),
            "artistId": str(song.get("artistId", "")),
            "album": song.get("album", ""),
            "releaseYear": song.get("releaseYear", ""),
            "duration": song.get("duration", ""),
            "genres": song.get("genre", []),
            "lyrics": song.get("lyrics_lrc", "") or "",
            "audioUrl": song.get("audioUrl", ""),
            "image": song.get("coverArt", ""),
            "url": f"http://localhost:3000/song/{song.get('_id')}",
            "keywords": [normalize_text(title), normalize_for_match(title)]
        })

    # Rebuild ALBUM_ENTRIES
    ALBUM_ENTRIES = []
    for album in ALBUMS_DATA:
        title = album.get("title", "")
        ALBUM_ENTRIES.append({
            "type": "album",
            "album_id": str(album.get("_id", "")),
            "title": title,
            "matchKey": normalize_for_match(title),
            "titleNorm": normalize_text(title),
            "artist_id": str(album.get("artist_id", "")),
            "release_year": album.get("release_year", ""),
            "image": album.get("cover_image", ""),
            "url": f"http://localhost:3000/album/{album.get('_id')}",
            "keywords": [normalize_text(title), normalize_for_match(title)]
        })

# Initial data load
refresh_data()

# -------------------------
# Matching functions
# -------------------------
def similarity(a: str, b: str) -> float:
    """SequenceMatcher ratio on normalized strings (keeps some flexibility)."""
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()

def find_best_entry_by_name(query: str, entries: List[Dict[str, Any]], name_fields: List[str] = None,
                            threshold: float = 0.6) -> Tuple[Optional[Dict[str, Any]], float]:
    """
    Find best matching entry in entries for query.
    - name_fields: list of fields to compare (e.g., ["name","matchKey"])
    - returns (best_entry, score)
    """
    if not query:
        return None, 0.0
    q_norm = normalize_text(query)
    q_match = normalize_for_match(query)

    best = None
    best_score = 0.0

    for e in entries:
        candidates = []
        if name_fields:
            for f in name_fields:
                if e.get(f):
                    candidates.append(str(e.get(f)))
        else:
            candidates = [e.get("name", "") or "", e.get("title", "") or "", e.get("matchKey", "") or "", e.get("titleNorm", "") or ""]

        for cand in candidates:
            if not cand:
                continue
            cand_norm = normalize_text(cand)
            cand_match = normalize_for_match(cand)

            if cand_norm and (cand_norm in q_norm or q_norm in cand_norm):
                score = 1.0
            elif cand_match and (cand_match in q_match or q_match in cand_match):
                score = 1.0
            else:
                score = max(similarity(q_norm, cand_norm), similarity(q_match, cand_match))

            if score > best_score:
                best_score = score
                best = e

    if best_score >= threshold:
        return best, best_score
    return None, best_score

# -------------------------
# Utility: parse user asking N songs of artist
# -------------------------
def parse_number_and_artist(prompt: str) -> Tuple[Optional[int], Optional[str]]:
    """
    Try to parse patterns like:
    - "cho tôi 5 bài của Sơn Tùng"
    - "5 bài của Sơn Tùng FTP"
    - "tôi muốn 3 bài của Đen Vâu"
    Returns (number, artist_name_raw_or_none)
    """
    if not prompt:
        return None, None
    text = prompt.lower()

    m = re.search(r"(\d+)\s*(?:bài|bai|ca khuc|bai hat)\s*(?:của|cua)\s+(.+)", text)
    if m:
        num = int(m.group(1))
        artist_raw = m.group(2).strip()
        return num, artist_raw

    for word, val in _NUMBER_WORDS.items():
        if f"{word} bài" in text or f"{word} bai" in text:
            m2 = re.search(rf"{word}\s*(?:bài|bai).*(?:của|cua)\s+(.+)", text)
            if m2:
                artist_raw = m2.group(1).strip()
                return val, artist_raw
            m3 = re.search(r"(?:của|cua)\s+(.+)", text)
            if m3:
                return val, m3.group(1).strip()

    m3 = re.search(r"(?:của|cua)\s+(.+)", text)
    if m3:
        n = extract_number_from_text(text)
        return n, m3.group(1).strip()

    n = extract_number_from_text(text)
    if n:
        return n, None

    return None, None

# -------------------------
# Main async handler
# -------------------------
async def handle_user_question(prompt: str) -> str:
    """Primary entry: returns markdown string"""
    try:
        if not prompt or not prompt.strip():
            return "Xin hãy nhập câu hỏi hợp lệ."

        # Refresh data to ensure latest database entries are used
        refresh_data()

        logger.info(f"[handle_user_question] Prompt: {prompt}")
        language = detect_language(prompt)
        norm_prompt = normalize_text(prompt)

        # 1) Quick predefined responses
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
            "greeting": {
                "questions": [
                    "xin chào", "chào bạn", "hello", "hi", "chào buổi sáng",
                    "chào buổi tối", "chào buổi trưa", "hey", "good morning",
                    "good evening", "good afternoon", "hallo", "yo"
                ],
                "answer_vi": "👋 Xin chào! Mình có thể giúp gì cho bạn hôm nay?",
                "answer_en": "👋 Hello! How can I help you today?",
            },
        }

        for group in CUSTOM_RESPONSES.values():
            for q in group["questions"]:
                if q and q in norm_prompt:
                    return group["answer_vi"] if language == "vi" else group["answer_en"]

        # 2) Song count quick query
        if any(kw in prompt.lower() for kw in ["bao nhiêu bài", "tổng số bài", "có bao nhiêu nhạc", "số lượng bài hát"]):
            return f"🎧 Hệ thống hiện có tổng cộng {len(SONG_ENTRIES)} bài hát."

        # 3) Genre mappings
        GENRE_NORMALIZATION_MAP = {
            "edm": ["dance", "dance-pop", "pop", "remix", "electronic", "edm"],
            "buồn": ["ballad", "sad", "r&b", "acoustic"],
            "thư giãn": ["chill", "relax", "lofi", "acoustic"],
            "love": ["love", "romantic", "pop", "r&b"],
            "rap": ["rap", "hiphop", "hip-hop"],
            "vietnamese": ["vietnamese", "v-pop", "việt", "vietnam"],
            "uk-us": ["english", "us-uk", "uk/us", "pop", "r&b", "dance-pop"],
        }

        for genre_key, synonyms in GENRE_NORMALIZATION_MAP.items():
            if any(kw in prompt.lower() for kw in synonyms):
                matched_songs = [
                    song for song in SONG_ENTRIES
                    if any(normalize_text(g) in [normalize_text(k) for k in synonyms] for g in song.get("genres", []))
                ]
                if not matched_songs:
                    return f"😥 Hiện không tìm thấy bài hát thuộc thể loại **{genre_key}**."
                reply = "\n\n🎵 " + (f"Một số bài hát thuộc thể loại **{genre_key}** bạn có thể thích:" if language == "vi"
                                      else f"Some songs in the **{genre_key}** genre you might enjoy:") + "\n"
                songs_by_artist = defaultdict(list)
                for song in matched_songs:
                    songs_by_artist[song["artist"]].append(song)
                count = 0
                for artist, songs in songs_by_artist.items():
                    for song in songs[:3]:
                        reply += f"- [{song['title']}]({song['url']}) – {artist}\n"
                        count += 1
                        if count >= 10:
                            break
                    if count >= 10:
                        break
                return reply

        # 4) PRIORITY: Artist / Song / Album matching
        requested_number, artist_raw = parse_number_and_artist(prompt)
        if artist_raw:
            artist_entry, score = find_best_entry_by_name(artist_raw, ARTIST_ENTRIES, name_fields=["name", "matchKey"])
            if artist_entry:
                artist_name = artist_entry["name"]
                artist_id = artist_entry.get("artist_id", "")
                songs_by_artist = [
                    s for s in SONG_ENTRIES
                    if (s.get("artist") and normalize_text(s.get("artist")) == normalize_text(artist_name))
                    or (s.get("artistId") and s.get("artistId") == artist_id)
                ]
                if not songs_by_artist:
                    return f"😥 Hiện không tìm thấy bài hát của nghệ sĩ **{artist_name}**."

                limit = requested_number or 5
                limited = songs_by_artist[:limit]

                reply = ""
                if artist_entry.get("image"):
                    reply += f"![Ảnh nghệ sĩ]({artist_entry.get('image')})\n\n"
                try:
                    gemini_prompt = f"Giới thiệu ngắn về nghệ sĩ {artist_name} và liệt kê {limit} bài hát nổi bật của họ."
                    gemini_text = await ask_gemini(gemini_prompt)
                    if gemini_text:
                        reply += gemini_text + "\n\n"
                except Exception:
                    reply += f"🎵 Dưới đây là {limit} bài hát của nghệ sĩ **{artist_name}**:\n\n"

                for s in limited:
                    if s.get("image"):
                        reply += f"![Ảnh bài hát]({s.get('image')})\n"
                    title = s.get("title", "Không rõ")
                    url = s.get("url", "")
                    reply += f"- [{title}]({url}) — {s.get('artist','')}\n\n"

                if artist_entry.get("url"):
                    reply += f"👉 Xem thêm: [{artist_name}]({artist_entry.get('url')})"
                return reply

        artist_candidate, artist_score = find_best_entry_by_name(prompt, ARTIST_ENTRIES, name_fields=["name", "matchKey"])
        if artist_candidate and artist_score >= 0.6:
            artist_name = artist_candidate["name"]
            artist_id = artist_candidate.get("artist_id", "")
            artist_bio = artist_candidate.get("bio", "")
            artist_image = artist_candidate.get("image", "")
            artist_url = artist_candidate.get("url", "")

            reply = ""
            if artist_image:
                reply += f"![Ảnh nghệ sĩ]({artist_image})\n\n"
            try:
                intro_prompt = f"Giới thiệu ngắn về nghệ sĩ {artist_name}.\nTiểu sử: {artist_bio}" if artist_bio else f"Giới thiệu ngắn về nghệ sĩ {artist_name}."
                intro = await ask_gemini(intro_prompt)
                reply += intro + "\n\n"
            except Exception:
                reply += (f"{artist_name}\n\n" + (artist_bio + "\n\n" if artist_bio else ""))

            songs_by_artist = [
                s for s in SONG_ENTRIES
                if (s.get("artist") and normalize_text(s.get("artist")) == normalize_text(artist_name))
                or (s.get("artistId") and s.get("artistId") == artist_id)
            ]
            if songs_by_artist:
                reply += "🎵 Một số bài nổi bật:\n"
                for s in songs_by_artist[:5]:
                    if s.get("image"):
                        reply += f"![Ảnh bài]({s.get('image')})\n"
                    reply += f"- [{s.get('title')}]({s.get('url')})\n"
            if artist_url:
                reply += f"\n👉 Xem thêm: [{artist_name}]({artist_url})"
            return reply

        song_candidate, song_score = find_best_entry_by_name(prompt, SONG_ENTRIES, name_fields=["titleNorm", "matchKey"])
        if song_candidate and song_score >= 0.6:
            song_title = song_candidate.get("title", "bài hát không rõ")
            artist_name = song_candidate.get("artist", "").strip()
            release_year = song_candidate.get("releaseYear", "")
            song_id = song_candidate.get("song_id", "")
            artist_bio = ""

            for a in ARTIST_ENTRIES:
                if a.get("name", "").lower() == (artist_name or "").lower() or str(a.get("artist_id", "")) == song_candidate.get("artistId", ""):
                    artist_bio = a.get("bio", "").strip()
                    break
            if artist_bio:
                artist_bio = artist_bio[:400]

            if artist_name:
                if artist_bio:
                    extra_info = (
                        f"Hãy giới thiệu ngắn bài hát '{song_title}' của ca sĩ {artist_name} phát hành năm {release_year}.\nThông tin nghệ sĩ: {artist_bio}"
                        if language == "vi" else
                        f"Describe the song '{song_title}' by artist {artist_name}, released in {release_year}.\nArtist bio: {artist_bio}"
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

            try:
                reply_text = await ask_gemini(extra_info)
            except Exception:
                reply_text = extra_info

            response = ""
            if song_candidate.get("image"):
                response += f"![Ảnh bài hát]({song_candidate['image']})\n\n"
            response += reply_text
            if song_id:
                response += (
                    f"\n\n👉 Nghe bài hát: [{song_title}](http://localhost:3000/song/{song_id})"
                    if language == "vi" else
                    f"\n\n👉 Listen to the song: [{song_title}](http://localhost:3000/song/{song_id})"
                )
            return response

        album_candidate, album_score = find_best_entry_by_name(prompt, ALBUM_ENTRIES, name_fields=["titleNorm", "matchKey"])
        if album_candidate and album_score >= 0.6:
            album_title = album_candidate.get("title", "album không rõ")
            release_year = album_candidate.get("release_year", "")
            artist_id = album_candidate.get("artist_id", "")
            artist_name = ""
            for artist in ARTIST_ENTRIES:
                if str(artist.get("artist_id", "")) == artist_id:
                    artist_name = artist.get("name", "")
                    break

            extra_info = (
                f"Hãy giới thiệu về album '{album_title}' của ca sĩ {artist_name} phát hành năm {release_year}."
                if language == "vi" else
                f"Tell me about the album '{album_title}' by artist {artist_name}, released in {release_year}."
            )
            try:
                reply = await ask_gemini(extra_info)
            except Exception as e:
                logger.exception("Gemini error: %s", e)
                reply = (
                    f"Album **{album_title}** của ca sĩ **{artist_name}** phát hành năm {release_year}."
                    if language == "vi" else
                    f"The album **{album_title}** by artist {artist_name}, released in {release_year}."
                )

            if album_candidate.get("image"):
                reply = f"![Ảnh album]({album_candidate['image']})\n\n" + reply

            reply += (
                f"\n\n👉 Bạn có thể xem thêm về album: [{album_title}]({album_candidate['url']})"
                if language == "vi" else
                f"\n\n👉 You can learn more about the album: [{album_title}]({album_candidate['url']})"
            )
            return reply

        # 5) Lyrics search
        lyric_keywords = ["lời bài hát", "lyric", "lời", "câu hát"]
        is_explicit_lyric_query = any(kw in norm_prompt for kw in lyric_keywords)

        if is_explicit_lyric_query:
            search_text = re.sub(r"(loi bai hat|lyric|loi|cau hat)", "", norm_prompt).strip()
        else:
            search_text = norm_prompt

        matched_songs = []
        for song in SONG_ENTRIES:
            lyrics = song.get("lyrics")
            if not lyrics:
                continue
            norm_lyrics = normalize_text(lyrics)
            if not search_text:
                continue

            lines = re.split(r'\n|\[.*?\]', norm_lyrics)
            lines = [line.strip() for line in lines if line.strip()]

            max_score = 0.0
            for line in lines:
                if search_text in line:
                    max_score = 1.0
                    break
                else:
                    line_score = similarity(search_text, line)
                    if line_score > max_score:
                        max_score = line_score

            if max_score > 0.7:
                matched_songs.append((song, max_score))

        matched_songs.sort(key=lambda x: x[1], reverse=True)
        matched_songs = matched_songs[:5]

        DEFAULT_COVER_ART = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/600px-No-Image-Placeholder.svg.png"

        if matched_songs:
            response = ""
            if is_explicit_lyric_query:
                response += "Dưới đây là lời bài hát phù hợp với bài hát bạn miêu tả:\n\n" if language == "vi" else "Here are the lyrics matching your query:\n\n"
            else:
                response += "Dựa trên câu hỏi của bạn, đây là một số bài hát có lời liên quan:\n\n" if language == "vi" else "Based on your query, here are some songs with related lyrics:\n\n"

            for song, score in matched_songs:
                song_title = song["title"]
                artist_name = song["artist"]
                song_url = song["url"]
                cover_art = song.get("image") or DEFAULT_COVER_ART

                response += f"![Ảnh bìa]({cover_art})\n\n"
                response += f"**{song_title} - {artist_name}**\n\n👉 Nghe bài hát: [{song_title}]({song_url})\n\n---\n\n"

            return response.strip()

        # 6) Final fallback: Gemini
        try:
            logger.info("[handle_user_question] Fallback to Gemini")
            reply = await ask_gemini(prompt)
            if reply:
                return reply
        except Exception as e:
            logger.exception("Gemini fallback error: %s", e)

        # 7) If everything fails
        return "😥 Không tìm thấy thông tin phù hợp. Vui lòng thử lại!" if language == "vi" else "😥 No matching information found. Please try again!"

    except Exception as e:
        logger.exception("Unhandled error in handle_user_question: %s", e)
        return f"⚠️ Đã xảy ra lỗi khi xử lý yêu cầu: {str(e)}"