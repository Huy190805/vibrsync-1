"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, Heart } from "lucide-react";
import WaveBars from "@/components/ui/WaveBars";
import { useMusic } from "@/context/music-context";

export default function RecommendSection() {
  const [songs, setSongsData] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    currentSong,
    isPlaying,
    setSongs,
    playSong,
    setContext,
    setContextId,
  } = useMusic();

  // ✅ Tách hàm fetch ra ngoài useEffect
  const fetchRecommendations = async (userId, limit = 12) => {
    const cacheKey = `recommend_cache_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setSongsData(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.warn("⚠️ Lỗi đọc cache:", err);
      }
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/recommendations?user_id=${userId}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Failed to fetch recommendations");

      const data = await res.json();
      console.log("🎵 Recommended songs:", data);
      setSongsData(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.error("❌ Fetch error:", err.message);
      setSongsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      console.warn("⚠️ No user_id found in localStorage.");
      setLoading(false);
      return;
    }

    setUserId(storedUserId);
    fetchRecommendations(storedUserId);
  }, []);

  if (loading)
    return (
      <div className="text-white px-4 py-4">
        <span className="animate-pulse text-gray-400">⏳ Đang tải gợi ý...</span>
      </div>
    );

  if (!userId)
    return (
      <div className="text-white px-4 py-2">
        ⚠️ Bạn cần đăng nhập để nhận gợi ý bài hát.
      </div>
    );

  if (!songs.length)
    return (
      <div className="text-white px-4 py-2">
        📭 Không tìm thấy gợi ý phù hợp cho bạn.
      </div>
    );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
        <Link
          href="/recommendations"
          className="text-sm text-purple-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {songs.map((song) => {
          const enrichedSong = {
            ...song,
            id: song.id || song._id || song.song_id,
            audioUrl: song.audio_url || song.audioUrl,
            coverArt: song.cover_art || song.coverArt || "/placeholder.svg",
          };

          const isLiked = likedSongs.includes(enrichedSong.id);
          const isThisSongPlaying =
            isPlaying && currentSong?.id === enrichedSong.id;

          const toggleLike = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLikedSongs((prev) =>
              prev.includes(enrichedSong.id)
                ? prev.filter((id) => id !== enrichedSong.id)
                : [...prev, enrichedSong.id]
            );
          };

          const handlePlay = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const enrichedSongs = songs.map((s) => ({
              ...s,
              id: s.id || s._id || s.song_id,
              audioUrl: s.audio_url || s.audioUrl,
              coverArt: s.cover_art || s.coverArt || "/placeholder.svg",
              artist_id: s.artist_id || song.artist_id,
            }));

            setSongs(enrichedSongs);
            setContext("recommendation");
            setContextId(null);
            playSong(enrichedSong);
          };

          return (
            <Link
              key={enrichedSong.id}
              href={`/song/${enrichedSong.id}`}
              className="group relative"
            >
              {/* Cover */}
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gray-800">
                <Image
                  src={enrichedSong.coverArt}
                  alt={enrichedSong.title || "Recommended song"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay Buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={toggleLike}
                    className="bg-black/70 hover:bg-black text-white rounded-full p-2"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>

                  <button
                    onClick={handlePlay}
                    className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-2"
                  >
                    {isThisSongPlaying ? (
                      <WaveBars />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-sm font-medium text-center text-white truncate">
                {enrichedSong.title}
              </h3>
              <p className="text-xs text-gray-400 text-center">
                {enrichedSong.artist}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
