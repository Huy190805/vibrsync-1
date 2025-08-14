"use client";

// Chỉ định đây là Client Component trong Next.js, cho phép sử dụng các tính năng phía client như hooks.
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import Image from "next/image";
import { Heart, MoreHorizontal, Play, Music4, Star } from "lucide-react";
import { fetchSongsByGenre } from "@/lib/api/songs";
import { useMusic } from "@/context/music-context";
import WaveBars from "@/components/ui/WaveBars";
import { formatDuration } from "@/lib/utils";
import debounce from "lodash/debounce";

// Tải chậm (lazy load) các thành phần để cải thiện hiệu suất, chỉ tải khi cần thiết.
const SongOptionsMenu = lazy(() => import("@/components/album/SongOptionsMenu"));
const PopupPortal = lazy(() => import("@/components/album/PopupPortal"));

// Hàm trộn ngẫu nhiên danh sách bài hát bằng thuật toán Fisher-Yates.
const getRandomSongs = (songsArray) => {
  const array = [...songsArray];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function SongList({ genre, isCurrentFromPlaylist }) {
  // Quản lý trạng thái cho danh sách bài hát, trạng thái tải, bài hát yêu thích, hàng được hover, số lượng bài hiển thị, menu tùy chọn, và thông báo.
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [optionsOpenId, setOptionsOpenId] = useState(null);
  const [toast, setToast] = useState("");
  const songListRef = useRef(null);
  const moreBtnRefs = useRef({});
  const toastTimeoutRef = useRef(null);
  // Truy cập ngữ cảnh âm nhạc toàn cục để quản lý phát nhạc, bài hát hiện tại, và danh sách bài hát.
  const { playSong, setContext, setContextId, setSongs: setGlobalSongs, currentSong, isPlaying } = useMusic();

  // Chuẩn hóa thể loại (genre) thành chữ thường để so sánh.
  const normalizedGenre = genre?.toLowerCase() || "";

  // Hàm xử lý cuộn để tải thêm bài hát khi người dùng cuộn gần cuối danh sách.
  const handleScroll = useCallback(
    debounce(() => {
      const element = songListRef.current;
      if (element && element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
        setVisibleCount((prev) => Math.min(prev + 5, songs.length));
      }
    }, 200),
    [songs.length]
  );

  // Hàm hiển thị thông báo tạm thời (toast) với thời gian tồn tại tùy chỉnh.
  const showToast = (message, duration = 2000) => {
    clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(""), duration);
  };

  // Hàm bật/tắt menu tùy chọn cho bài hát.
  const toggleOptions = (songId) => {
    setOptionsOpenId((prev) => (prev === songId ? null : songId));
  };

  // Hàm xử lý phát một bài hát cụ thể.
  const handlePlay = (song) => {
    if (!song || !song.id || !song.title) {
      console.error("Invalid song data:", song);
      showToast("Unable to play song: Invalid data");
      return;
    }
    console.log("Playing song:", { id: song.id, title: song.title, contextId: `genre-${normalizedGenre}` });
    setContext("playlist");
    setContextId(`genre-${normalizedGenre}`);
    setGlobalSongs(songs);
    playSong({
      ...song,
      contextId: `genre-${normalizedGenre}`,
    });
  };

  // Hàm xử lý thêm bài hát vào danh sách phát (chưa triển khai).
  const handleAddToPlaylist = (song) => {
    if (!song) return;
    showToast("Add to playlist functionality is not implemented here yet");
  };

  // Hook useEffect để tải danh sách bài hát theo thể loại khi genre thay đổi.
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);
        if (!genre) {
          setSongs([]);
          showToast("No category providedp");
          console.warn("No genre provided");
          return;
        }
        const res = await fetchSongsByGenre(genre);
        console.log("API response:", res);
        if (!res || !Array.isArray(res.songs)) {
          console.error("Invalid API response:", res);
          setSongs([]);
          showToast("Unable to download song");
          return;
        }
        // Kiểm tra và lọc bài hát hợp lệ
        const validSongs = res.songs.filter(
          (song) => song && song.id && song.title && Array.isArray(song.genre)
        );
        console.log("Valid songs:", validSongs);
        if (validSongs.length === 0) {
          console.warn(`No valid songs found for genre: ${genre}`);
          showToast(`No song found for ${genre}`);
        }
        const randomSongs = getRandomSongs(validSongs);
        console.log("Randomized songs:", randomSongs);
        setSongs(randomSongs);
        setGlobalSongs(randomSongs);
      } catch (err) {
        console.error("Error loading songs:", err);
        setSongs([]);
        showToast("Unable to download song");
      } finally {
        setLoading(false);
      }
    };
    loadSongs();
  }, [genre, setGlobalSongs]);

  // Hook useEffect để thêm sự kiện cuộn cho danh sách bài hát và dọn dẹp khi component bị hủy.
  useEffect(() => {
    const element = songListRef.current;
    if (element) {
      element.addEventListener("wheel", handleScroll, { passive: true });
      return () => element.removeEventListener("wheel", handleScroll);
    }
  }, [handleScroll]);

  return (
    // Container chính của danh sách bài hát với chiều cao cố định, cuộn dọc, và ẩn thanh cuộn.
    <div
      className="h-[600px] overflow-y-auto scrollbar-hide rounded-xl"
      ref={songListRef}
      style={{ scrollBehavior: "smooth" }}
    >
      {/* CSS tùy chỉnh để ẩn thanh cuộn trên các trình duyệt khác nhau */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {loading ? (
        // Hiển thị thông báo đang tải khi dữ liệu chưa sẵn sàng.
        <p className="text-gray-400 text-center py-10">Đang tải bài hát...</p>
      ) : songs.length === 0 ? (
        // Hiển thị thông báo khi không tìm thấy bài hát cho thể loại.
        <p className="text-gray-500 text-center py-10">Không tìm thấy bài hát cho thể loại {genre}.</p>
      ) : (
        // Hiển thị danh sách bài hát trong lưới với số lượng giới hạn bởi visibleCount.
        <div className="grid gap-3">
          {songs.slice(0, visibleCount).map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              // Hàng bài hát với hiệu ứng hover và trạng thái đang phát.
              <div
                key={song.id}
                className={`flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 shadow-md ${
                  isCurrent && isPlaying ? "bg-white/10 ring-2 ring-[#39FF14]" : ""
                }`}
                onMouseEnter={() => setHoveredRowId(song.id)}
                onMouseLeave={() => setHoveredRowId(null)}
              >
                {/* Cột biểu tượng: hiển thị WaveBars khi đang phát, nút Play khi hover, hoặc Music4 khi bình thường */}
                <div className="w-12 text-gray-400 flex-shrink-0">
                  {isCurrent && isPlaying ? (
                    <WaveBars />
                  ) : hoveredRowId === song.id ? (
                    <button
                      onClick={() => handlePlay(song)}
                      className="focus:outline-none"
                      aria-label={`Play ${song.title}`}
                    >
                      <Play
                        size={18}
                        className="text-[#39FF14] animate-pulse scale-110"
                      />
                    </button>
                  ) : (
                    <Music4 size={18} className="text-gray-400" />
                  )}
                </div>
                {/* Cột thông tin bài hát: hình ảnh, tiêu đề, và nghệ sĩ */}
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => handlePlay(song)}
                  role="button"
                  aria-label={`Phát ${song.title} của ${song.artist}`}
                >
                  <div className="relative w-12 h-12 group">
                    <Image
                      src={song.coverArt || "/placeholder.svg"}
                      alt={song.title}
                      fill
                      className="object-cover rounded group-hover:opacity-80 transition"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-medium truncate max-w-[200px] md:max-w-[300px]">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate max-w-[200px] md:max-w-[300px]">
                      {song.artist}
                    </p>
                  </div>
                </div>
                {/* Cột tên album, chỉ hiển thị trên màn hình lớn */}
                <div className="hidden md:flex text-gray-300 flex-shrink-0 max-w-[200px] truncate">
                  {song.album}
                </div>
                {/* Cột nút tương tác: yêu thích, thời lượng, và menu tùy chọn */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() =>
                      setLikedSongs((prev) => {
                        const updated = new Set(prev);
                        updated.has(song.id)
                          ? updated.delete(song.id)
                          : updated.add(song.id);
                        return updated;
                      })
                    }
                    className={`hover:text-pink-500 transition-all ${
                      likedSongs.has(song.id) ? "text-pink-500" : "text-gray-400"
                    }`}
                    aria-label={
                      likedSongs.has(song.id)
                        ? `Unlike ${song.title}`
                        : `Prefer ${song.title}`
                    }
                  >
                    <Heart
                      size={18}
                      fill={likedSongs.has(song.id) ? "currentColor" : "none"}
                    />
                  </button>
                  <div className="text-right w-16">
                    {formatDuration(song.duration)}
                  </div>
                  <div className="flex items-center w-16 justify-end">
                    <button
                      ref={(el) => (moreBtnRefs.current[song.id] = el)}
                      onClick={() => toggleOptions(song.id)}
                      className="text-gray-400 hover:text-white"
                      aria-label={`Other options for ${song.title}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Hiển thị menu tùy chọn cho bài hát khi được mở */}
      {optionsOpenId && (() => {
        const song = songs.find((s) => s.id === optionsOpenId);
        if (!song) return null;
        return (
          <Suspense fallback={<div>Loading options ...</div>}>
            <PopupPortal>
              <SongOptionsMenu
                song={song}
                anchorRef={moreBtnRefs.current[optionsOpenId]}
                onClose={() => setOptionsOpenId(null)}
                onAddToPlaylist={() => handleAddToPlaylist(song)}
              />
            </PopupPortal>
          </Suspense>
        );
      })()}
      {/* Hiển thị thông báo tạm thời (toast) nếu có nội dung */}
      {toast && (
        <div
          role="alert"
          className="fixed top-4 right-4 bg-gradient-to-r from-[#39FF14] to-[#00CED1] text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2 max-w-xs"
        >
          <Star size={18} fill="currentColor" />
          {toast}
        </div>
      )}
    </div>
  );
}

export default SongList;