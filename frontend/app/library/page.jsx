"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PlaylistGrid from "@/components/playlist/playlist-grid";
import SongList from "@/components/songs/song-list";
import { fetchPlaylists, fetchSongs } from "@/lib/api";

// 🔁 Wrapper to fetch with sessionStorage cache
async function getCachedOrFetch(key, fetcher) {
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  sessionStorage.setItem(key, JSON.stringify(data));
  return data;
}

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [historySongs, setHistorySongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);
  const router = useRouter();

  // 🔐 Auth check
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/signin");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // 📦 Load all data once token is present
  useEffect(() => {
    if (!token) return;

    const loadLibraryData = async () => {
      try {
        setLoading(true);

        const [playlistData, songDataRaw] = await Promise.all([
          getCachedOrFetch("cache_user_playlists", fetchPlaylists),
          getCachedOrFetch("cache_user_songs", fetchSongs),
        ]);

        setPlaylists(playlistData || []);

        const songData = Array.isArray(songDataRaw)
          ? songDataRaw
          : songDataRaw?.songs || [];

        setLikedSongs(songData.slice(0, 10));
        setHistorySongs(songData.slice(10, 20));
      } catch (err) {
        console.error("❌ Failed to load library:", err);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadLibraryData();
  }, [token, router]);

  if (!token || loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading your library...
      </div>
    );
  }

  return (
    <div className="space-y-10 px-6 py-8">
      <h1 className="text-3xl font-bold mb-4">Your Library</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Playlists</h2>
        <PlaylistGrid playlists={playlists} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Recently Played</h2>
        <SongList songs={historySongs} />
      </div>
    </div>
  );
}
