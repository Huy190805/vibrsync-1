"use client";

import { useState, useEffect } from "react";
import { addSongToPlaylist, getAllPlaylists } from "@/lib/api/playlists";

export default function SongActionsMenu({ song }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  useEffect(() => {
    if (isOpen) {
      getAllPlaylists().then(setPlaylists);
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!selectedPlaylist) return;
    try {
      await addSongToPlaylist(selectedPlaylist, song.id);
      alert("✅ Song added!");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to add song:", err);
      alert("❌ Failed to add song.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm mt-2 space-y-2 hover:bg-white/10 rounded p-2 cursor-pointer w-full text-left"
      >
        Add to Playlist
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
          <div className="bg-zinc-900 text-white rounded-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Add to playlist</h2>

            <select
              value={selectedPlaylist}
              onChange={(e) => setSelectedPlaylist(e.target.value)}
              className="w-full bg-zinc-800 p-2 rounded mb-4"
            >
              <option value="">-- Select a playlist --</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleAdd}
              disabled={!selectedPlaylist}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition disabled:opacity-50"
            >
              Add to Playlist
            </button>
          </div>
        </div>
      )}
    </>
  );
}
