"use client";
//liked_song_song-list.jsx
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import { useMusic } from "@/context/music-context";
import { formatDuration } from "@/lib/utils";
import SongActionsMenu from "./song-actions-menu";
import WaveBars from "../ui/WaveBars";

export default function SongList({ songs }) {
  const { playSong, isPlaying, currentSong, togglePlayPause, nextSong } = useMusic();

  const [optionsOpenId, setOptionsOpenId] = useState(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [likedSongs, setLikedSongs] = useState(new Set());

  const moreBtnRefs = useRef({});
  const popupRef = useRef(null);
  const observerRef = useRef(null);

  const handlePlayClick = (song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  const toggleLike = (songId) => {
    const updated = new Set(likedSongs);
    updated.has(songId) ? updated.delete(songId) : updated.add(songId);
    setLikedSongs(updated);
  };

  const toggleOptions = (songId) => {
    if (optionsOpenId === songId) {
      setOptionsOpenId(null);
      return;
    }

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
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setOptionsOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!optionsOpenId || !moreBtnRefs.current[optionsOpenId]) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && !entries[0].isIntersecting) {
          setOptionsOpenId(null);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(moreBtnRefs.current[optionsOpenId]);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [optionsOpenId]);

  const handleLyrics = (songId) => {
    console.log(`View lyrics for song ${songId}`);
    setOptionsOpenId(null);
  };

  const handlePlayNext = () => {
    nextSong();
    setOptionsOpenId(null);
  };

  const handleBlock = (songId) => {
    console.log(`Block song ${songId}`);
    setOptionsOpenId(null);
  };

  const handleCopyLink = (songId) => {
    const link = `${window.location.origin}/song/${songId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        alert("✅ Link copied to clipboard!");
        setOptionsOpenId(null);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        alert("❌ Failed to copy link.");
        setOptionsOpenId(null);
      });
  };

  return (
    <div className="bg-white/5 rounded-lg overflow-hidden relative">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-gray-400 text-sm">
            <th className="p-4 w-12">#</th>
            <th className="p-4">Title</th>
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
                key={song.id || song._id || `${index}-${song.title}`}
                className={`transition hover:bg-white/10 ${isCurrent ? "bg-white/10" : ""}`}
                >

                <td className="p-4 text-gray-400">
                  {isCurrent && isPlaying ? <WaveBars /> : index + 1}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-12 h-12 cursor-pointer group"
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
                <td className="p-4 hidden md:table-cell text-gray-300">{song.album}</td>
                <td className="p-4 hidden md:table-cell text-gray-300">
                  {formatDuration(song.duration)}
                </td>
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

      {optionsOpenId && (() => {
        const song = songs.find((s) => s.id === optionsOpenId);
        if (!song) return null;

        return (
          <div
            ref={popupRef}
            className="fixed w-72 bg-[#181818] text-white rounded-xl shadow-xl z-50 p-4 animate-fadeIn"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            <div className="flex gap-3 items-start">
              <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0">
                <Image
                  src={song.coverArt || "/placeholder.svg"}
                  alt="cover"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 group relative">
                <div className="font-semibold text-base truncate group-hover:underline">
                  {song.title}
                </div>
                <div className="text-sm text-gray-400">{song.artist}</div>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-3">
              <SongActionsMenu song={song} onClose={() => setOptionsOpenId(null)} />
              <ul className="text-sm mt-2 space-y-2">
                <li className="hover:bg-white/10 rounded p-2 cursor-pointer" onClick={() => handleLyrics(song.id)}>Lyrics</li>
                <li className="hover:bg-white/10 rounded p-2 cursor-pointer" onClick={handlePlayNext}>Play Next</li>
                <li className="hover:bg-white/10 rounded p-2 cursor-pointer" onClick={() => handleBlock(song.id)}>Block</li>
                <li className="hover:bg-white/10 rounded p-2 cursor-pointer" onClick={() => handleCopyLink(song.id)}>Copy Link</li>
              </ul>
            </div>
          </div>
        );
      })()}
    </div>
  );
}