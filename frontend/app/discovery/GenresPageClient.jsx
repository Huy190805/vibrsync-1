"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/utils";
import { useMusic } from "@/context/music-context";

export default function GenresPageClient() {
  const [songs, setSongs] = useState([]);
  const [region, setRegion] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useMusic();
  const router = useRouter();

  const fetchSongs = async (refresh = false) => {
    setIsLoading(true);
    try {
      // Kiểm tra sessionStorage
      const cacheKey = `songs_${region}`;
      if (!refresh) {
        const cachedSongs = sessionStorage.getItem(cacheKey);
        if (cachedSongs) {
          setSongs(JSON.parse(cachedSongs));
          setIsLoading(false);
          return;
        }
      }

      const params = new URLSearchParams();
      if (region !== "all") params.append("region", region);
      if (refresh || region !== "all") params.append("refresh", "true");

      const query = params.toString();
      const response = await apiFetch(`/api/songs${query ? `?${query}` : ""}`);
      const songsData = response.songs?.slice(0, 8) || [];

      setSongs(songsData);
      // Lưu vào sessionStorage
      sessionStorage.setItem(cacheKey, JSON.stringify(songsData));
    } catch (err) {
      console.error("Failed to fetch songs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [region]);

  // Lắng nghe sự kiện cập nhật danh sách bài hát (nếu có)
  useEffect(() => {
    const handleSongsUpdate = () => {
      // Xóa cache khi danh sách bài hát được cập nhật
      sessionStorage.removeItem(`songs_${region}`);
      fetchSongs(true);
    };

    window.addEventListener("songsUpdated", handleSongsUpdate);
    return () => window.removeEventListener("songsUpdated", handleSongsUpdate);
  }, [region]);

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const handleReset = () => {
    fetchSongs(true);
  };

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Discover Songs by Region</h1>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 text-white"
        >
          <RotateCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {["all", "vietnamese", "international"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-xl transition ${
              region === type
                ? "bg-purple-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleRegionChange(type)}
          >
            {type === "all"
              ? "All"
              : type === "vietnamese"
              ? "Vietnamese"
              : "International"}
          </button>
        ))}
      </div>

      {songs.length === 0 ? (
        <p>No songs found.</p>
      ) : (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-xl">
              <p className="text-white text-sm animate-pulse">Loading new songs...</p>
            </div>
          )}
          <div
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            {songs.map((song) => {
              const id = song._id || song.id;
              return (
                <div
                  key={id}
                  className="bg-gray-900 p-4 rounded-2xl shadow hover:shadow-lg transition relative group"
                >
                  <div className="relative w-full h-48 overflow-hidden rounded-xl">
                    <Link href={`/song/${id}`}>
                      <Image
                        src={song.coverArt || "/default-cover.jpg"}
                        alt={song.title || "Untitled"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                        priority={false} // Tắt priority để lazy load
                        placeholder="blur"
                        blurDataURL="/default-cover.jpg"
                      />
                    </Link>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Link
                      href={`/song/${id}`}
                      className="block text-lg font-semibold text-white hover:text-purple-400 transition-colors"
                    >
                      {song.title || "Untitled"}
                    </Link>

                    {song.artist && song.artistId ? (
                      <Link
                        href={`/artist/${song.artistId}`}
                        className="text-sm text-purple-400 hover:underline truncate block"
                      >
                        {song.artist}
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-400 truncate">
                        {song.artist || "Unknown Artist"}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => playSong(song)}
                    className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full p-2 shadow hover:bg-purple-700"
                  >
                    <Play size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}