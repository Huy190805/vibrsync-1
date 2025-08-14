"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { useMusic } from "@/context/music-context";
import { getAllPublicPlaylists, getPlaylistById } from "@/lib/api/playlists";
import { getSongById } from "@/lib/api/songs";

export default function PublicPlaylistsSection() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { setSongs, setContext, setContextId, playSong } = useMusic();

  useEffect(() => {
    getAllPublicPlaylists()
      .then((data) => setPlaylists(data.slice(0, 8)))
      .catch((err) => console.error("Failed to fetch public playlists", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePlay = async (playlist) => {
    try {
      const playlistDetail = await getPlaylistById(playlist.id);
      if (!playlistDetail?.songIds?.length) {
        console.warn("Playlist không có bài hát để phát");
        return;
      }

      // Lấy thông tin bài hát chi tiết theo songIds
      const songs = await Promise.all(
        playlistDetail.songIds.map((songId) => getSongById(songId))
      );
      const validSongs = songs.filter(Boolean);

      if (validSongs.length === 0) {
        console.warn("Playlist không có bài hát để phát");
        return;
      }

      // Cập nhật context nhạc và phát bài đầu tiên
      setSongs(validSongs);
      setContext("playlist");
      setContextId(playlist.id);
      playSong(validSongs[0]);
    } catch (error) {
      console.error("Failed to play playlist", error);
    }
  };

  if (isLoading) return <p className="text-gray-400">Đang tải playlist...</p>;

  if (playlists.length === 0)
    return <p className="text-gray-400">Không có playlist công khai nào.</p>;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Impressive Playlist</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            className="relative bg-gray-900 p-3 rounded-xl hover:bg-gray-800 transition shadow group"
          >
            {/* Ảnh playlist */}
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <Link href={`/playlist/${pl.id}`}>
                <Image
                  src={pl.coverArt || "/default-cover.jpg"}
                  alt={pl.name || "Playlist"}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </Link>
            </div>

            {/* Nút Play */}
            <button
              onClick={() => handlePlay(pl)}
              className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full p-2 shadow hover:bg-purple-700 transition transform scale-90 group-hover:scale-100"
              aria-label={`Phát playlist ${pl.title || pl.name}`}
            >
              <Play size={18} />
            </button>

            {/* Thông tin */}
            <p className="mt-3 font-semibold truncate">{pl.title || pl.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {pl.description || "Không có mô tả"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
