"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Play, Heart, MoreHorizontal, X } from "lucide-react";
import { useMusic } from "@/context/music-context";
import { formatDuration } from "@/lib/utils";
import WaveBars from "@/components/ui/WaveBars";
import SongActionsMenu from "./song-actions-menu";

export default function PlaylistSongList({ songs: propSongs, playlistId, onSongsChange }) {
  const {
    playSong, isPlaying, currentSong, togglePlayPause,
    setSongs, setContext, setContextId
  } = useMusic();

  const [optionsOpenId, setOptionsOpenId] = useState(null);
  const [songs, setLocalSongs] = useState(propSongs);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [likedSongs, setLikedSongs] = useState(new Set());

  const moreBtnRefs = useRef({});
  const popupRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const selectedSong = useMemo(() =>
    songs.find((s) => s.id === optionsOpenId), [songs, optionsOpenId]
  );

  const handlePlayClick = (song) => {
    if (!song) return;
    const isSameSong = currentSong?.id?.toString() === song.id?.toString();
    if (isSameSong) togglePlayPause();
    else {
      setSongs(songs);
      setContext("new-releases");
      setContextId(null);
      playSong(song);
    }
  };

  const handleRemoveFromPlaylist = async (songId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/playlists/${playlistId}/songs/${songId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true
        }
      );
      setOptionsOpenId(null);

      setLocalSongs((prev) => {
        const updated = prev.filter((s) => s.id !== songId);
        if (onSongsChange) onSongsChange(updated); // chỉ gọi sau khi setState
        return updated;
      });

    } catch (err) {
      console.error("❌ Remove failed:", err);
    }
  };

  const toggleLike = async (songId) => {
    try {
      const updated = new Set(likedSongs);
      const url = likedSongs.has(songId) ? `unlike` : `like`;
      await axios.post(`http://localhost:8000/api/likes/${songId}/${url}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      likedSongs.has(songId) ? updated.delete(songId) : updated.add(songId);
      setLikedSongs(updated);
    } catch (err) {
      console.error("❌ Like toggle failed:", err);
    }
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

  const handleCopyLink = () => {
    const link = `${window.location.origin}/song/${optionsOpenId}`;
    navigator.clipboard.writeText(link)
      .then(() => alert("✅ Link copied"))
      .catch(() => alert("❌ Copy failed"));
    setOptionsOpenId(null);
  };

  useEffect(() => {
    setLocalSongs(propSongs); // đồng bộ khi propSongs thay đổi
  }, [propSongs]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const promises = songs.map(song =>
          axios.get(`http://localhost:8000/api/likes/is-liked/${song.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.data.isLiked ? song.id : null)
        );
        const results = await Promise.all(promises);
        setLikedSongs(new Set(results.filter(Boolean)));
      } catch (err) {
        console.error("❌ Fetch liked songs error:", err);
      }
    };
    if (token && songs.length) fetchLikedSongs();
  }, [songs, token]);

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
    const el = moreBtnRefs.current[optionsOpenId];
    if (!optionsOpenId || !el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setOptionsOpenId(null);
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [optionsOpenId]);

  return (
    <div className="bg-purple-950 shadow-md rounded-xl overflow-hidden relative border border-purple-800">
      <div
        ref={scrollRef}
        className="max-h-[360px] overflow-y-auto scroll-container transition-all duration-300 scrollbar-thin scrollbar-thumb-purple-800 scrollbar-track-purple-950"
        onScroll={() => {
          scrollRef.current?.classList.add("scrolling");
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => {
            scrollRef.current?.classList.remove("scrolling");
          }, 1000);
        }}
      >
        <table className="w-full text-sm text-left">
          <thead className="top-0 bg-purple-900 z-10">
            <tr className="border-b border-purple-700 text-purple-100 uppercase">
              <th className="p-3 w-10 font-medium">#</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium hidden md:table-cell">Album</th>
              <th className="p-3 font-medium hidden md:table-cell">Duration</th>
              <th className="p-3 w-10 text-right font-medium">•••</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => {
              const isCurrent = currentSong?.id?.toString() === song.id?.toString();
              const isLiked = likedSongs.has(song.id);

              return (
                <tr
                  key={song.id}
                  className={`group border-b border-purple-800 hover:bg-purple-900 transition ${isCurrent ? "bg-purple-900" : ""}`}
                >
                  <td className="p-3 text-purple-400">
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
                        <Link href={`/song/${song.id}`} className="text-purple-100 font-medium hover:underline">
                          {song.title}
                        </Link>
                        <div className="text-sm text-purple-400">{song.artist}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-purple-400 hidden md:table-cell">{song.album || "N/A"}</td>
                  <td className="p-3 text-purple-400 hidden md:table-cell">{formatDuration(song.duration || 0)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleLike(song.id)}
                        className={`hover:text-white ${isLiked ? "text-pink-500" : "text-purple-400"}`}>
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                      <button
                        ref={(el) => (moreBtnRefs.current[song.id] = el)}
                        onClick={() => toggleOptions(song.id)}
                        className="text-purple-400 hover:text-white"
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

      {optionsOpenId && selectedSong && (
        <div
          ref={popupRef}
          className="fixed w-72 bg-purple-900 text-white rounded-xl shadow-xl z-50 p-4 animate-fadeIn"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <div className="flex gap-3">
            <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0">
              <Image
                src={selectedSong.coverArt || "/placeholder.svg"}
                alt="cover"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-base truncate">{selectedSong.title}</div>
              <div className="text-sm text-purple-300">{selectedSong.artist}</div>
            </div>
            <button onClick={() => setOptionsOpenId(null)} className="text-purple-300 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="mt-4 border-t border-purple-700 pt-3">
            <ul className="text-sm mt-2 space-y-2">
              <li onClick={() => handleRemoveFromPlaylist(optionsOpenId)} className="hover:bg-purple-800 rounded p-2 cursor-pointer">Remove from playlist</li>
              <li onClick={handleCopyLink} className="hover:bg-purple-800 rounded p-2 cursor-pointer">Copy Link</li>
              <SongActionsMenu song={selectedSong} onClose={() => setOptionsOpenId(null)} />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
