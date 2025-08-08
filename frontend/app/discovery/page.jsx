
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/utils";
import { useMusic } from "@/context/music-context";
import Top100 from "./top100"; // ✅ Giữ phần Top100 cũ

// Dữ liệu New Releases tĩnh
const newReleases = [
  {
    title: "Trao Về Anh",
    artist: "Juky San",
    time: "2 hours ago",
    region: "vietnam",
    image: "/jukysan.jpg",
  },
  {
    title: "Chinatown",
    artist: "Jaigon Orchestra",
    time: "Today",
    region: "international",
    image: "/chinatown.jpg",
    premium: true,
  },
  {
    title: "I'LL BE THERE",
    artist: "EM XINH, Orange",
    time: "Yesterday",
    region: "vietnam",
    image: "/illbethere.jpg",
  },
  {
    title: "Cruel Summer",
    artist: "Taylor Swift",
    time: "2 days ago",
    region: "usuk",
    image: "/taylor.jpg",
  },
  {
    title: "Kill This Love",
    artist: "BLACKPINK",
    time: "3 days ago",
    region: "usuk",
    image: "/blackpink.jpg",
  },
];

export default function DiscoveryPage() {
  const [songs, setSongs] = useState([]);
  const [region, setRegion] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { playSong } = useMusic();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  // 🔹 Fetch bài hát động từ API theo region
  const fetchSongs = async (refresh = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (region !== "all") params.append("region", region);
      if (refresh || region !== "all") params.append("refresh", "true");

      const query = params.toString();
      const response = await apiFetch(`/api/songs${query ? `?${query}` : ""}`);
      setSongs(response.songs?.slice(0, 12) || []);
    } catch (err) {
      console.error("Failed to fetch songs", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs(true);
  }, [region]);

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const handleReset = () => {
    fetchSongs(true);
  };

  // 🔹 Lọc New Releases tĩnh
  const filteredReleases = newReleases.filter((song) => {
    if (activeTab === "all") return true;
    return song.region === activeTab;
  });

  return (
    <div className="p-6 min-h-screen bg-black text-white space-y-10">
      {/* Top100 section */}
      <Top100 />

      {/* DISCOVER SONGS BY REGION */}
      <div>
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
                <p className="text-white text-sm animate-pulse">
                  Loading new songs...
                </p>
              </div>
            )}
            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${
                isLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              {songs.map((song) => {
                const id = song._id || song.id;
                const artistName = song.artist || "Unknown Artist";
                const artistId = song.artistId;

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
                          priority
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

                      {artistId ? (
                        <Link
                          href={`/artist/${artistId}`}
                          className="text-sm text-purple-400 hover:underline truncate block"
                        >
                          {artistName}
                        </Link>
                      ) : (
                        <p className="text-sm text-gray-400 truncate">
                          {artistName}
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

      {/* NEW RELEASES SECTION
      <section>
        <h2 className="text-2xl font-bold mb-2">International Music</h2>

        <div className="flex gap-2 mb-6">
          {["all", "vietnam", "international", "usuk"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-3 py-1 rounded border border-white/10 ${
                activeTab === tab
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {tab === "all"
                ? "All"
                : tab === "vietnam"
                ? "Vietnam"
                : tab === "international"
                ? "International"
                : "US-UK"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReleases.map((song, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 rounded-lg"
            >
              <Image
                src={song.image}
                alt={song.title}
                width={60}
                height={60}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-semibold">{song.title}</h4>
                <p className="text-sm text-gray-400">{song.artist}</p>
                <p className="text-xs text-gray-500">{song.time}</p>
              </div>
              {song.premium && (
                <span className="text-xs text-yellow-300 border border-yellow-300 rounded px-2 py-0.5">
                  PREMIUM
                </span>
              )}
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
}
