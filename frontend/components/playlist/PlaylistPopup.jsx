"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function PlaylistPopup({ isOpen, onClose, song, onAdded }) {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/playlists")
        .then(res => res.json())
        .then(data => setPlaylists(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const addToPlaylist = async (playlistId) => {
    await fetch(`/api/playlists/${playlistId}/add-song`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId: song.id }),
    });
    onAdded?.();
    onClose();
  };

  const createPlaylistAndAdd = async () => {
    const res = await fetch(`/api/playlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newName }),
    });
    const data = await res.json();
    addToPlaylist(data.id);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-zinc-900 text-white rounded-lg p-6 w-[90%] max-w-md shadow-xl space-y-5">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold">Add to Playlist</h2>

        {/* Playlist list */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="flex items-center justify-between px-3 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
            >
              <span className="truncate">{pl.title}</span>
              <button
                className="text-purple-400 hover:underline text-sm"
                onClick={() => addToPlaylist(pl.id)}
              >
                Add
              </button>
            </div>
          ))}
        </div>

        {/* New playlist creation */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <input
            type="text"
            placeholder="New playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 placeholder:text-zinc-400"
          />
          <button
            onClick={createPlaylistAndAdd}
            className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-2 rounded font-medium"
          >
            Create and Add
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
