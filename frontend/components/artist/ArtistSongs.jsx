"use client";
import { useState } from "react"; // ✅ Thêm dòng này
import { useMusic } from "@/context/music-context";
import SongList from "@/components/songs/song-list"

export default function ArtistSongs({ songs = [] }) {
  const [showAllSongs, setShowAllSongs] = useState(false);
  const visibleSongs = showAllSongs ? songs : songs.slice(0, 5);

  const { setSongs, setContext, setContextId, playSong } = useMusic();

  const handlePlay = (song) => {
    setSongs(songs);                    // 🎯 Chỉ dùng danh sách này
    setContext("artist");
    setContextId(song.artist_id || song.artistId); // dùng đúng key
    playSong(song);
  };

  if (!songs || songs.length === 0) {
    return <p className="text-gray-400">No songs available for this artist.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">🎵 Songs by this artist</h2>

      {/* 🔁 Truyền hàm onPlay xuống */}
      <SongList songs={visibleSongs} onPlay={handlePlay} />

      {songs.length > 5 && (
        <div className="text-right">
          <button
            onClick={() => setShowAllSongs((prev) => !prev)}
            className="mt-2 text-sm text-purple-400 hover:underline"
          >
            {showAllSongs ? "Ẩn bớt" : ""}
          </button>
        </div>
      )}
    </div>
  );
}
