"use client";

// ======= Import các Hook và thành phần giao diện =======
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { useMusic } from "@/context/music-context";
import { getAllPlaylists, createPlaylist, addSongToPlaylist } from "@/lib/api/playlists";

import AlbumMoreMenu from "@/components/album/AlbumMoreMenu";
import AlbumToast from "@/components/album/AlbumToast";
import PlaylistPopup from "@/components/playlist/PlaylistPopup";
import PopupPortal from "./PopupPortal";

// ======= Import icon từ thư viện Lucide-react =======
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  MoreHorizontal,
  Share2,
  PlusCircle,
  Eye,
  Star,
  Headphones,
} from "lucide-react";


export default function AlbumHeader({ album, artist, songs }) {
  // ======= Hook từ context âm nhạc =======
  const {
    playSong,
    togglePlayPause,
    currentSong,
    isPlaying,
    setSongs,
    setContext,
    setContextId,
  } = useMusic();

  // ======= State quản lý giao diện =======
  const [isFollowing, setIsFollowing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const menuRef = useRef(null);

  // ======= Kiểm tra bài hát hiện tại có nằm trong album không =======
  const isCurrentFromAlbum = songs.some((song) => song.id === currentSong?.id);

  // ======= Xử lý phát tất cả bài hát =======
  const handlePlayAll = () => {
    if (!songs.length) return;

    setContext("album");
    setContextId(album.id);
    setSongs(songs);

    if (isCurrentFromAlbum && isPlaying) {
      togglePlayPause();
      setToast("Paused");
    } else {
      const song = songs[0];
      playSong(song);
      setToast(`Now Playing: ${song.title}`);
    }

    setTimeout(() => setToast(""), 2000);
  };

  // ======= Xử lý Shuffle bài hát ngẫu nhiên =======
  const handleShuffle = () => {
    if (!songs.length) return;

    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    const song = shuffled[0];

    setContext("album");
    setContextId(album.id);
    setSongs(shuffled);

    playSong(song);
    setToast(`Shuffling: ${song.title}`);

    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      setToast("");
    }, 3500);
  };

  // ======= Theo dõi / Bỏ theo dõi nghệ sĩ =======
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setToast(isFollowing ? "Unfollowed artist" : "Following artist");
    setTimeout(() => setToast(""), 2000);
  };

  // ======= Sao chép liên kết chia sẻ album =======
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast("Copied link to clipboard");
    setShowMenu(false);
    setTimeout(() => setToast(""), 2000);
  };

  // ======= Mở popup thêm vào playlist =======
  const handleAddToPlaylist = () => {
    setShowPopup(true);
    setShowMenu(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // ======= Đóng menu More nếu click ra ngoài =======
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ======= Cập nhật toast khi phát bài từ SongSection =======
  useEffect(() => {
    if (currentSong && isPlaying && isCurrentFromAlbum) {
      setToast(`Now Playing: ${currentSong.title}`);
      const timeout = setTimeout(() => setToast(""), 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentSong?.id, isPlaying]);

  // ======= Giao diện chính =======
  return (
    <div className="relative w-full max-w-6xl mx-auto bg-[#1f1f1f]/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-[#39FF14]/20 transition-all duration-300">

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Ảnh đại diện album */}
        <div className="relative w-80 h-80 group">
          <Image
            src={album.cover_art || "/placeholder.svg"}
            alt={album.title}
            fill
            priority
            className="object-cover rounded-xl shadow-xl group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Headphones size={24} className="text-[#39FF14] animate-pulse" />
            <span className="text-sm text-gray-200">Album Spotlight</span>
          </div>
        </div>

        {/* Thông tin album */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#39FF14] to-[#D8BFD8]">
            {album.title}
          </h1>

          <AlbumToast message={toast} />

          <div className="flex items-center justify-center md:justify-start gap-3">
            <Star size={22} className="text-[#39FF14]" />
            <p className="text-lg text-gray-200">
              Artist: {artist?.name || "Unknown Artist"}
            </p>
          </div>

          <p className="text-gray-300">Release Year: {album.release_year || "Unknown"}</p>
          <p className="text-gray-300">Genre: {album.genres || "Unknown"}</p>

          {/* Các nút chức năng: Play, Shuffle, Follow, More */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start relative">

            {/* Nút Play / Pause */}
            <button
              onClick={handlePlayAll}
              disabled={!songs.length}
              className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                isCurrentFromAlbum && isPlaying
                  ? "bg-gradient-to-r from-[#FF6A6A] to-[#D8BFD8]"
                  : "bg-gradient-to-r from-[#39FF14] to-[#D8BFD8]"
              }`}
            >
              {isCurrentFromAlbum && isPlaying ? (
                <>
                  <Pause size={20} /> Pause
                </>
              ) : (
                <>
                  <Play size={20} /> Play All
                </>
              )}
            </button>

            {/* Nút Shuffle */}
            <button
              onClick={handleShuffle}
              disabled={!songs.length}
              className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${
                isShuffling
                  ? "bg-gradient-to-r from-[#D8BFD8] to-[#FF6A6A]"
                  : "bg-[#2A2A2A]/60 text-gray-200"
              }`}
            >
              <Shuffle size={20} /> Shuffle
            </button>

            {/* Nút Follow */}
            <button
              onClick={handleFollow}
              disabled={!artist}
              className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${
                isFollowing
                  ? "bg-gradient-to-r from-[#D8BFD8] to-[#FF6A6A]"
                  : "bg-[#2A2A2A]/60 text-gray-200"
              }`}
            >
              <Heart size={20} fill={isFollowing ? "currentColor" : "none"} />
              {isFollowing ? "Following" : "Follow"}
            </button>

            {/* Menu More (Share, Add to Playlist, View Artist) */}
            <div className="relative" ref={menuRef}>
              <AlbumMoreMenu
                artist={artist}
                onShare={handleShare}
                onAddToPlaylist={handleAddToPlaylist}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Popup Thêm vào Playlist */}
      <PlaylistPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        song={songs[0]}
        onAdded={() => setToast("Added to playlist")}
      />
    </div>
  );
}