"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, MoreHorizontal, Play, Music3Icon, Heart } from "lucide-react";

import { useMusic } from "@/context/music-context";
import { formatDuration } from "@/lib/utils";

import WaveBars from "../ui/WaveBars";
import PopupPortal from "./PopupPortal";
import SongOptionsMenu from "./SongOptionsMenu";

export default function SongSection({ songs }) {
  const {
    playSong,
    isPlaying,
    currentSong,
    togglePlayPause,
    nextSong,
    setContext,
    setContextId,
    setSongs,
  } = useMusic();

  // Trạng thái các menu và thao tác
  const [optionsOpenId, setOptionsOpenId] = useState(null);         // ID của bài hát có menu đang mở
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });    // Vị trí popup (không dùng trực tiếp ở đây)
  const [likedSongs, setLikedSongs] = useState(new Set());          // Danh sách bài hát đã like
  const [hoveredRowId, setHoveredRowId] = useState(null);           // ID hàng đang hover

  const moreBtnRefs = useRef({});                                   // Lưu ref tới từng nút "more" của từng bài
  const popupRef = useRef(null);                                    // Ref popup hiện tại

  // 👉 Phát bài hát
  const handlePlayClick = (song) => {
    setContext("album");
    setContextId(song.albumId);
    setSongs(songs);
    playSong(song);
  };

  // 👉 Mở / đóng menu tùy chọn
  const toggleOptions = (songId) => {
    setOptionsOpenId((prevId) => (prevId === songId ? null : songId));
  };

  // 👉 Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setOptionsOpenId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mt-10 p-6 sm:p-8 bg-[#1f1f1f]/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#39FF14]/20 space-y-6">
      {/* === Tiêu đề phần bài hát === */}
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Music3Icon size={24} className="text-[#39FF14]" />
        Songs in this Album
      </h3>

      {/* === Bảng danh sách bài hát === */}
      {songs.length > 0 ? (
        <div className="bg-white/5 rounded-lg overflow-hidden relative">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400 text-sm">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Title</th>
                <th className="p-4 text-center">Prefer</th>
                <th className="p-4 hidden md:table-cell">Album</th>
                <th className="p-4 hidden md:table-cell">Duration</th>
                <th className="p-4 w-12 text-right">•••</th>
              </tr>
            </thead>

            <tbody>
              {songs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const isLiked = likedSongs.has(song.id);

                return (
                  <tr
                    key={song.id}
                    className={`transition hover:bg-white/10 ${isCurrent ? "bg-white/10" : ""}`}
                    onMouseEnter={() => setHoveredRowId(song.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    {/* STT hoặc trạng thái phát */}
                    <td className="p-4 text-gray-400">
                      {isCurrent && isPlaying ? (
                        <WaveBars />
                      ) : hoveredRowId === song.id ? (
                        <Play size={18} className="text-[#39FF14] animate-pulse scale-110" />
                      ) : (
                        index + 1
                      )}
                    </td>

                    {/* Tiêu đề và nghệ sĩ */}
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="relative w-16 h-16 cursor-pointer group"
                          onClick={() => handlePlayClick(song)}
                        >
                          <Image
                            src={song.coverArt || "/placeholder.svg"}
                            alt="cover"
                            fill
                            className="object-cover rounded group-hover:opacity-80 transition"
                          />
                        </div>

                        <div className="flex flex-col">
                          <Link
                            href={`/song/${song.id}`}
                            className="text-white font-medium truncate max-w-[180px] hover:underline"
                          >
                            {song.title}
                          </Link>
                          <Link
                            href={`/artist/${song.artistId}`}
                            className="text-sm text-gray-400 truncate max-w-[180px] hover:underline"
                          >
                            {song.artist}
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Nút Like */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setLikedSongs((prev) => {
                            const updated = new Set(prev);
                            isLiked ? updated.delete(song.id) : updated.add(song.id);
                            return updated;
                          });
                        }}
                        className={`hover:text-pink-500 transition-all ${
                          isLiked ? "text-pink-500" : "text-gray-400"
                        }`}
                      >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                    </td>

                    {/* Album */}
                    <td className="p-4 hidden md:table-cell text-gray-300">{song.album}</td>

                    {/* Thời lượng */}
                    <td className="p-4 hidden md:table-cell text-gray-300">
                      {formatDuration(song.duration)}
                    </td>

                    {/* Nút menu tùy chọn */}
                    <td className="p-4 text-right">
                      <button
                        ref={(el) => (moreBtnRefs.current[song.id] = el)}
                        onClick={() => toggleOptions(song.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* === Hiển thị menu popup nếu được mở === */}
          {optionsOpenId && (() => {
            const song = songs.find((s) => s.id === optionsOpenId);
            if (!song) return null;

            return (
              <PopupPortal>
                <SongOptionsMenu
                  song={song}
                  anchorRef={moreBtnRefs.current[optionsOpenId]}
                  onClose={() => setOptionsOpenId(null)}
                />
              </PopupPortal>
            );
          })()}
        </div>
      ) : (
        // === Thông báo khi không có bài hát ===
        <div className="flex items-center gap-3 text-yellow-300 bg-yellow-900/20 p-4 rounded-lg border border-yellow-400/20">
          <AlertCircle size={20} />
          <p className="text-sm">No songs available for this album.</p>
        </div>
      )}
    </div>
  );
}