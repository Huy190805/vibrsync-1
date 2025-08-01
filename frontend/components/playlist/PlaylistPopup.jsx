"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Gọi API danh sách playlist và thao tác thêm
import {
  getAllPlaylists,
  createPlaylist,
  addSongToPlaylist,
} from "@/lib/api/playlists";

export default function PlaylistPopup({ isOpen, onClose, song, onAdded }) {
  // Danh sách playlist hiện có
  const [playlists, setPlaylists] = useState([]);

  // Tên playlist mới người dùng muốn tạo
  const [newName, setNewName] = useState("");

  // Khi popup mở, gọi API lấy danh sách playlist
  useEffect(() => {
    if (isOpen) {
      getAllPlaylists()
        .then(setPlaylists)
        .catch(console.error);
    }
  }, [isOpen]);

  // Xử lý khi người dùng nhấn "Add" vào một playlist có sẵn
  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addSongToPlaylist(playlistId, song.id);
      onAdded?.();   // Gọi callback nếu có
      onClose();     // Đóng popup sau khi thêm thành công
    } catch (err) {
      console.error("Failed to add song:", err);
    }
  };

  // Xử lý tạo playlist mới và thêm bài hát vào luôn
  const handleCreatePlaylistAndAdd = async () => {
    try {
      const newPlaylist = await createPlaylist({
        title: newName,
        creator: song.creator || "unknown",
        songIds: [song.id],
      });
      await handleAddToPlaylist(newPlaylist.id);
    } catch (err) {
      console.error("Failed to create playlist:", err);
    }
  };

  // Nếu popup không mở thì không render gì cả
  if (!isOpen) return null;

  // Giao diện Popup
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-zinc-900 text-white rounded-lg p-6 w-[90%] max-w-md shadow-xl space-y-5">
        
        {/* Nút đóng popup */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề popup */}
        <h2 className="text-lg font-semibold">Add to Playlist</h2>

        {/* Danh sách các playlist có sẵn */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {playlists.length > 0 ? (
            playlists.map((pl) => (
              <div
                key={pl.id}
                className="flex items-center justify-between px-3 py-2 bg-zinc-800 rounded hover:bg-zinc-700"
              >
                <span className="truncate">{pl.title}</span>
                <button
                  className="text-purple-400 hover:underline text-sm"
                  onClick={() => handleAddToPlaylist(pl.id)}
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No playlists found.</p>
          )}
        </div>

        {/* Khu vực tạo playlist mới */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <input
            type="text"
            placeholder="New playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 placeholder:text-zinc-400"
          />

          <button
            onClick={handleCreatePlaylistAndAdd}
            className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-2 rounded font-medium"
            disabled={!newName.trim()}
          >
            Create and Add
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}