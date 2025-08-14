"use client";

import { useState } from "react";
import SongList from "@/components/songs/song-list";
import { Play } from "lucide-react";
import { useMusic } from "@/context/music-context";

export default function TopSongs({ topSongs = [] }) {
  const [showAllTopSongs, setShowAllTopSongs] = useState(false);
  const { setSongs, playSong, setContext, setContextId } = useMusic();
  const visibleTopSongs = showAllTopSongs ? topSongs : topSongs.slice(0, 5);

  if (!topSongs || topSongs.length === 0) return null;
    const handlePlayTopSongs = () => {
    const enrichedSongs = topSongs.map((song) => ({
      ...song,
      id: song.id,
      audioUrl: song.audioUrl,
      coverArt: song.coverArt || "/placeholder.svg",
    }));

    setSongs(enrichedSongs); // ✅ thiết lập danh sách phát
    setContext("top-songs");
    setContextId("top-songs-month");

    if (enrichedSongs.length > 0) {
      playSong(enrichedSongs[0]); // ✅ phát bài đầu tiên
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Play
          size={24}
          className="text-green-500 cursor-pointer hover:scale-110 transition"
          onClick={handlePlayTopSongs} // ✅ gọi hàm play
        />
        Top Songs of the Month
      </h3>

      <SongList songs={visibleTopSongs} />

      {topSongs.length > 5 && (
        <button
          onClick={() => setShowAllTopSongs((prev) => !prev)}
          className="mt-4 text-purple-400 hover:underline text-sm"
        >
          {showAllTopSongs ? "Hide" : ""}
        </button>
      )}
    </div>
  );
}