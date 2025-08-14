"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Heart, MoreHorizontal, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useMusic } from "@/context/music-context";
import { formatDuration } from "@/lib/utils";
import WaveBars from "@/components/ui/WaveBars";
import SongActionsMenu from "./song-actions-menu";
import LikeSongButton from "@/components/liked-button/LikeButton";

export default function SongList({ songs: propSongs }) {
  const { playSong, isPlaying, currentSong, togglePlayPause, nextSong,  setSongs,
  setContext,setContextId } = useMusic();
  const [optionsOpenId, setOptionsOpenId] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [likedSongs, setLikedSongs] = useState(new Set());
  const moreBtnRefs = useRef({});
  const popupRef = useRef(null);
  const observerRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

const handlePlayClick = (song) => {
  if (!song) return;

  // Nếu đang phát bài đó thì toggle play/pause
  if (currentSong?.id?.toString() === song.id?.toString()) {
    togglePlayPause();
  } else {
    // Gán toàn bộ danh sách hiện tại làm context
    setSongs(propSongs);
    setContext("new-releases"); 
    setContextId(null); 
    playSong(song); 
  }
};

  const toggleLike = (songId) => {
    const updated = new Set(likedSongs);
    updated.has(songId) ? updated.delete(songId) : updated.add(songId);
    setLikedSongs(updated);
  };

  const toggleOptions = (songId) => {
    if (optionsOpenId === songId) return setOptionsOpenId(null);
    const rect = moreBtnRefs.current[songId]?.getBoundingClientRect();
    if (rect) {
      setPopupPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 300,
      });
    }
    setOptionsOpenId(songId);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOptionsOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!optionsOpenId || !moreBtnRefs.current[optionsOpenId]) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setOptionsOpenId(null);
      },
      { threshold: 0.1 }
    );

    observer.observe(moreBtnRefs.current[optionsOpenId]);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [optionsOpenId]);

  const handleLyrics = () => setOptionsOpenId(null);
  const handlePlayNext = () => {
    nextSong();
    setOptionsOpenId(null);
  };

  const handleBlock = () => {
    console.log(`Block song ${optionsOpenId}`);
    setOptionsOpenId(null);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/song/${optionsOpenId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert("✅ Link copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy link."));
    setOptionsOpenId(null);
  };

  return (
     <div className="bg-[#2f1047] shadow-md rounded-xl overflow-hidden relative border border-[#250f35]">
      <div
        ref={scrollRef}
        className="max-h-[360px] overflow-y-auto scroll-container transition-all duration-300 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900"
        onScroll={() => {
          if (scrollRef.current) scrollRef.current.classList.add("scrolling");
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => {
            scrollRef.current?.classList.remove("scrolling");
          }, 1000);
        }}
      >
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-[#250f35] z-10">
            <tr className="border-b border-[#250f35] text-purple-200 uppercase text-xs">
              <th className="p-3 w-10 font-medium">#</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium hidden md:table-cell">Album</th>
              <th className="p-3 font-medium hidden md:table-cell">Duration</th>
              <th className="p-3 w-10 text-right font-medium">•••</th>
            </tr>
          </thead>
          <tbody>
            {propSongs.map((song, index) => {
              const isCurrent = currentSong?.id?.toString() === song.id?.toString();
              const isLiked = likedSongs.has(song.id);

              return (
                <tr
                  key={song.id}
                  className={`group border-b border-[#30114a] ${
                    isCurrent ? "bg-[#250f35]" : "bg-[#2f1047] hover:bg-[#30114a]"
                  } transition`}
                >
                  <td className="p-3 text-gray-400">
                    <div className="w-6 h-6 flex items-center justify-center relative">
                      {isCurrent && isPlaying ? (
                        <WaveBars />
                      ) : (
                        <>
                          <span className="group-hover:opacity-0">{index + 1}</span>
                          <button
                            onClick={() => handlePlayClick(song)}
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          >
                            <Play size={16} className="text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={song.coverArt || "/placeholder.svg"}
                          alt={song.title || "Cover"}
                          fill
                          className={`object-cover ${isCurrent && isPlaying ? "animate-pulse" : ""}`}
                        />
                      </div>
                      <div className="relative group">
                        <Link href={`/song/${song.id}`} className="text-white font-medium hover:underline">
                          {song.title}
                        </Link>
                        <div className="text-sm text-neutral-400">{song.artist}</div>

                        <div className="absolute z-50 hidden group-hover:block top-full left-0 mt-2 w-64 p-3 bg-[#250f35] text-white text-xs rounded shadow-lg border border-[#30114a]">
                          <div><strong>Artist:</strong> {song.artist}</div>
                          <div><strong>Album:</strong> {song.album || "Unknown"}</div>
                          <div><strong>Genre:</strong> {Array.isArray(song.genre) ? song.genre.join(", ") : song.genre || "Unknown"}</div>
                          <div><strong>Release Year:</strong> {song.releaseYear || "Unknown"}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-400 hidden md:table-cell">
                    {song.album || "N/A"}
                  </td>
                  <td className="p-3 text-gray-400 hidden md:table-cell">
                    {formatDuration(song.duration || 0)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <LikeSongButton songId={song.id} />
                      <button
                        ref={(el) => (moreBtnRefs.current[song.id] = el)}
                        onClick={() => toggleOptions(song.id)}
                        className="text-purple-300 hover:text-white"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popup menu */}
      {optionsOpenId && (
        <div
          ref={popupRef}
          className="fixed w-72 bg-[#250f35] text-white rounded-xl shadow-xl z-50 p-4 animate-fadeIn"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="flex gap-3">
            <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0">
              <Image
                src={propSongs.find((s) => s.id === optionsOpenId)?.coverArt || "/placeholder.svg"}
                alt="cover"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base truncate">
                {propSongs.find((s) => s.id === optionsOpenId)?.title}
              </div>
              <div className="text-sm text-neutral-400">
                {propSongs.find((s) => s.id === optionsOpenId)?.artist}
              </div>
            </div>
            <button onClick={() => setOptionsOpenId(null)} className="text-purple-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 border-t border-zinc-700 pt-3">
            <SongActionsMenu
              song={propSongs.find((s) => s.id === optionsOpenId)}
              onClose={() => setOptionsOpenId(null)}
            />
            <ul className="text-sm mt-2 space-y-2">
              <li onClick={handleLyrics} className="hover:bg-zinc-700 rounded p-2 cursor-pointer">Lyrics</li>
              <li onClick={handlePlayNext} className="hover:bg-zinc-700 rounded p-2 cursor-pointer">Play Next</li>
              <li onClick={handleBlock} className="hover:bg-zinc-700 rounded p-2 cursor-pointer">Block</li>
              <li onClick={handleCopyLink} className="hover:bg-zinc-700 rounded p-2 cursor-pointer">Copy Link</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
