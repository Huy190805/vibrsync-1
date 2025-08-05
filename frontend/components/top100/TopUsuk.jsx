// frontend/components/top100/TopUsuk.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useMusic } from "@/context/music-context";

export default function TopLove() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { playSong, setSongs: setContextSongs, setContext, setContextId } = useMusic();

  useEffect(() => {
    const fetchTopLoveSongs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/top100/usuk");
        if (!res.ok) throw new Error("Không thể lấy dữ liệu từ server.");
        const data = await res.json();
        setSongs(data?.songs || []);

        setContext("top100-love");
        setContextId("love");
        setContextSongs(data?.songs || []);
      } catch (err) {
        setError("Không thể tải danh sách bài hát.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopLoveSongs();
  }, [setContext, setContextId, setContextSongs]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!songs.length) return <p>Không có bài hát Love nào.</p>;

  const topSong = songs[0];
  const topSongImage = topSong.cover_art || "/default-image.jpg";

  return (
    <div className="flex h-[80vh] p-4 gap-6 overflow-hidden">
      {/* Left panel - giữ nguyên màu gốc */}
      <div className="w-80 bg-gradient-to-b from-pink-500 to-red-600 text-white rounded-xl p-4 shrink-0 shadow-lg">
        <img
          src={topSongImage}
          alt="Top Love Song"
          className="w-full h-auto object-cover rounded-xl mb-4"
        />
        <h2 className="text-xl font-bold mb-2">Top 100 Bài Hát LOVE Hay Nhất</h2>
        <p className="text-sm mb-2">
          Cập nhật: {new Date().toLocaleDateString("vi-VN")}
        </p>
        <p className="text-sm">❤️ 3.1M người yêu thích</p>
      </div>

      {/* Song list - hover mờ và nổi nhẹ */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-custom">
        <ul className="space-y-2">
          {songs.map((song, index) => (
            <li
              key={song.id || index}
              className="flex items-center gap-4 p-3 rounded-xl transition duration-200 
                         hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-md group"
            >
              <span className="text-gray-500 font-semibold w-6 text-right">
                {index + 1}
              </span>
              <Image
                src={song.cover_art || "/default-image.jpg"}
                alt={song.title}
                width={48}
                height={48}
                className="rounded-md object-cover shadow-sm"
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Link
                  href={`/song/${song.id}`}
                  className="font-semibold truncate text-white hover:underline"
                >
                  {song.title}
                </Link>
                <span className="text-sm text-gray-500 truncate">
                  {song.artist || "Không rõ"}
                </span>
              </div>
              <button
                className="text-pink-500 group-hover:scale-110 hover:text-pink-600 transition"
                onClick={() => {
                  if (!song.audioUrl) {
                    alert("Bài hát này chưa có audio.");
                    return;
                  }
                  playSong(song);
                }}
              >
                <Play size={20} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
