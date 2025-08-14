"use client";

// Chỉ định đây là Client Component trong Next.js, cho phép sử dụng các tính năng phía client như hooks.
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import Image from "next/image";
import { Play, Pause, Shuffle, Heart, Star } from "lucide-react";
import { useMusic } from "@/context/music-context";

// Tải chậm (lazy load) các thành phần để cải thiện hiệu suất, chỉ tải khi cần thiết.
const AlbumMoreMenu = lazy(() => import("@/components/album/AlbumMoreMenu"));
const PlaylistPopup = lazy(() => import("@/components/playlist/PlaylistPopup"));

// Hàm trộn ngẫu nhiên danh sách bài hát bằng thuật toán Fisher-Yates.
const getRandomSongs = (songsArray) => {
  const array = [...songsArray];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function HeaderSection({ playlistData }) {
  // Phá vỡ cấu trúc props để lấy các thông tin của danh sách phát.
  const { title, image, subtitle, time, followers, genre } = playlistData;

  // Truy cập ngữ cảnh âm nhạc toàn cục để quản lý bài hát hiện tại, trạng thái phát, và danh sách bài hát.
  const {
    playSong,
    togglePlayPause,
    setContext,
    setContextId,
    setSongs: setGlobalSongs,
    songs: globalSongs,
    isPlaying,
    currentSong,
  } = useMusic();

  // Quản lý trạng thái cho việc theo dõi, trộn bài, hiển thị menu, popup, bài hát được chọn, và thông báo.
  const [isFollowing, setIsFollowing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimeoutRef = useRef(null);
  const menuRef = useRef(null);

  // Chuẩn hóa thể loại (genre) thành chữ thường để so sánh.
  const normalizedGenre = genre?.toLowerCase() || "";
  // Kiểm tra xem bài hát hiện tại có thuộc danh sách phát này không dựa trên contextId hoặc danh sách bài hát.
  const isCurrentContext = currentSong?.contextId?.toLowerCase() === `genre-${normalizedGenre.toLowerCase()}` || (currentSong && globalSongs.some(s => s.id === currentSong.id));

  // Hook useEffect để ghi log trạng thái khi các giá trị liên quan thay đổi, giúp debug.
  useEffect(() => {
    console.log("HeaderSection state:", {
      isPlaying,
      currentSong: currentSong
        ? { id: currentSong.id, title: currentSong.title, contextId: currentSong.contextId }
        : null,
      globalSongsLength: globalSongs?.length || 0,
      genre: normalizedGenre,
      isCurrentContext,
      contextIdMatch: currentSong?.contextId?.toLowerCase() === `genre-${normalizedGenre.toLowerCase()}`,
      audioRefExists: !!document.querySelector("audio"),
    });
  }, [isPlaying, currentSong, globalSongs, normalizedGenre]);

  // Hàm hiển thị thông báo tạm thời (toast) với thời gian tồn tại tùy chỉnh.
  const showToast = (message, duration = 2000) => {
    clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(""), duration);
  };

  // Hàm xử lý phát tất cả bài hát trong danh sách phát.
  const handlePlayAll = () => {
    if (!globalSongs?.length) {
      console.warn("No songs available to play");
      showToast("No songs available to play");
      return;
    }
    console.log("handlePlayAll called:", {
      isCurrentContext,
      isPlaying,
      firstSong: globalSongs[0] ? { id: globalSongs[0].id, title: globalSongs[0].title } : null,
      contextId: `genre-${normalizedGenre}`,
    });
    if (isCurrentContext && isPlaying) {
      togglePlayPause();
      showToast("Paused");
    } else {
      setContext("playlist");
      setContextId(`genre-${normalizedGenre}`);
      setGlobalSongs(globalSongs);
      if (globalSongs[0]) {
        playSong({
          ...globalSongs[0],
          contextId: `genre-${normalizedGenre}`,
        });
        showToast(`Now Playing: ${globalSongs[0].title}`);
      } else {
        console.error("First song is invalid:", globalSongs[0]);
        showToast("Cannot play: Invalid song data");
      }
    }
  };

  // Hàm xử lý trộn ngẫu nhiên danh sách bài hát và phát bài đầu tiên.
  const handleShuffle = () => {
    if (!globalSongs?.length) {
      console.warn("No songs available to shuffle");
      showToast("No songs available to shuffle");
      return;
    }
    setIsShuffling(true);
    const shuffledSongs = getRandomSongs(globalSongs);
    setContext("playlist");
    setContextId(`genre-${normalizedGenre}`);
    setGlobalSongs(shuffledSongs);
    if (shuffledSongs[0]) {
      playSong({
        ...shuffledSongs[0],
        contextId: `genre-${normalizedGenre}`,
      });
      showToast(`Shuffling: ${shuffledSongs[0].title}`);
    } else {
      console.error("First shuffled song is invalid:", shuffledSongs[0]);
      showToast("Cannot shuffle: Invalid song data");
    }
    setTimeout(() => {
      setIsShuffling(false);
      showToast("");
    }, 3500);
  };

  // Hàm xử lý theo dõi hoặc bỏ theo dõi danh sách phát.
  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    showToast(isFollowing ? "Unfollowed" : "Followed");
  };

  // Hàm xử lý chia sẻ (chưa được triển khai).
  const handleShare = () => {
    showToast("Share functionality not implemented yet!");
  };

  // Hàm xử lý thêm bài hát vào danh sách phát.
  const handleAddToPlaylist = (song) => {
    if (!song) {
      showToast("No song selected");
      return;
    }
    setSelectedSong(song);
    setShowPopup(true);
  };

  return (
    // Container chính của phần tiêu đề với khoảng cách dưới và vị trí tương đối.
    <div className="mb-8 relative">
      {/* Bố cục flex để hiển thị hình ảnh và thông tin danh sách phát. */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white/5 rounded-xl p-6 shadow-lg">
        {/* Hình ảnh danh sách phát với hiệu ứng hover. */}
        <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[200px] flex-shrink-0 group">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 200px, 250px"
            className="rounded-lg object-cover shadow-md transition-all duration-300 group-hover:ring-2 group-hover:ring-[#39FF14]"
          />
          {/* Nút phát/tạm dừng hiển thị khi hover lên hình ảnh. */}
          <button
            onClick={handlePlayAll}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlayAll();
              }
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-300 bg-black/50 rounded-lg"
            aria-label={isCurrentContext && isPlaying ? "Pause playlist" : "Play all songs"}
          >
            {isCurrentContext && isPlaying ? (
              <Pause size={40} className="text-[#39FF14]" />
            ) : (
              <Play size={40} className="text-[#39FF14]" />
            )}
          </button>
        </div>
        {/* Thông tin danh sách phát và các nút điều khiển. */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-lg text-gray-300 mt-2">{subtitle}</p>
          <p className="text-sm text-gray-400 mt-1">Updated: {time}</p>
          <p className="text-sm text-gray-400">Followers: {followers}</p>
          {/* Nhóm các nút điều khiển (Play All, Shuffle, Follow, Menu). */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
            {/* Nút phát/tạm dừng toàn bộ danh sách phát. */}
            <button
              onClick={handlePlayAll}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePlayAll();
                }
              }}
              disabled={!globalSongs?.length}
              className={`px-5 py-2 rounded-full font-semibold flex items-center gap-2 bg-gradient-to-r from-[#39FF14] to-[#00CED1] hover:from-[#32CD32] hover:to-[#20B2AA] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                isCurrentContext && isPlaying
                  ? "bg-gradient-to-r from-[#FF6A6A] to-[#D8BFD8]"
                  : ""
              }`}
              aria-label={isCurrentContext && isPlaying ? "Pause playlist" : "Play all songs"}
            >
              {isCurrentContext && isPlaying ? (
                <>
                  <Pause size={20} /> Pause
                </>
              ) : (
                <>
                  <Play size={20} /> Play All
                </>
              )}
            </button>
            {/* Nút trộn ngẫu nhiên danh sách bài hát. */}
            <button
              onClick={handleShuffle}
              disabled={!globalSongs?.length}
              className={`px-5 py-2 rounded-full font-semibold flex items-center gap-2 bg-[#2A2A2A]/60 hover:bg-[#3A3A3A] text-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
                isShuffling
                  ? "bg-gradient-to-r from-[#D8BFD8] to-[#FF6A6A]"
                  : ""
              }`}
              aria-label="Shuffle playlist"
            >
              <Shuffle size={20} /> Shuffle
            </button>
            {/* Nút theo dõi/bỏ theo dõi danh sách phát. */}
            <button
              onClick={handleFollow}
              className={`px-5 py-2 rounded-full font-semibold flex items-center gap-2 bg-[#2A2A2A]/60 hover:bg-[#3A3A3A] text-gray-200 transition-all duration-300 shadow-md ${
                isFollowing
                  ? "bg-gradient-to-r from-[#D8BFD8] to-[#FF6A6A]"
                  : ""
              }`}
              aria-label={isFollowing ? "Unfollow playlist" : "Follow playlist"}
            >
              <Heart size={20} fill={isFollowing ? "currentColor" : "none"} />
              {isFollowing ? "Following" : "Follow"}
            </button>
            {/* Menu tùy chọn bổ sung (chia sẻ, thêm vào danh sách phát). */}
            <div className="relative" ref={menuRef}>
              <Suspense fallback={<div>Loading menu...</div>}>
                <AlbumMoreMenu
                  onShare={handleShare}
                  onAddToPlaylist={() => handleAddToPlaylist(globalSongs[0])}
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      {/* Hiển thị thông báo tạm thời (toast) nếu có nội dung. */}
      {toast && (
        <div
          role="alert"
          className="absolute top-4 right-4 bg-gradient-to-r from-[#39FF14] to-[#00CED1] text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2 max-w-xs"
        >
          <Star size={18} fill="currentColor" />
          {toast}
        </div>
      )}
      {/* Popup để thêm bài hát vào danh sách phát. */}
      <Suspense fallback={null}>
        <PlaylistPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          song={selectedSong}
          onAdded={() => {
            showToast("Added to playlist");
          }}
        />
      </Suspense>
    </div>
  );
}

export default HeaderSection;