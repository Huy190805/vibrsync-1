"use client";

import { useState, useEffect } from "react";
import { addSongToPlaylist, getAllPlaylists } from "@/lib/api/playlists";
import { useAuth } from "@/context/auth-context";

export default function SongActionsMenu({ song }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        if (!user?.id) return;
        const data = await getAllPlaylists(user.id); // user-only
        setPlaylists(data || []);
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
      }
    };

    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen, user]);

  const handleAdd = async () => {
    if (!selectedPlaylist) return;
    try {
      await addSongToPlaylist(selectedPlaylist, song.id);
      alert("✅ Song added to playlist!");
      setIsOpen(false);
      setSelectedPlaylist(""); // reset
    } catch (error) {
      console.error("Add song failed:", error);
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
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-900 text-white rounded-2xl shadow-lg p-6 w-full max-w-sm relative animate-fade-in">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-center">Add to Playlist</h2>

            <select
              value={selectedPlaylist}
              onChange={(e) => setSelectedPlaylist(e.target.value)}
              className="w-full bg-zinc-800 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            >
              <option value="">-- Select a playlist --</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleAdd}
              disabled={!selectedPlaylist}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition disabled:opacity-50"
            >
              Add to Playlist
            </button>
          </div>
        </div>

      )}
    </>
  );
}
