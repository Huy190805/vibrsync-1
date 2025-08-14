"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { createPlaylist } from "@/lib/api/playlists";
import { useAuth } from "@/context/auth-context"; // ✅ Bổ sung dòng này


type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  banned?: boolean;
};


interface CustomCreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onPlaylistCreated?: (playlist: any) => void;
}

export default function CustomCreatePlaylistModal({
  open,
  onClose,
  onPlaylistCreated,
}: CustomCreatePlaylistModalProps) {
  const { user } = useAuth() as { user: User | null };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Playlist name is required.");
      return;
    }

    try {
      setLoading(true);
      const newPlaylist = await createPlaylist({
        title,
        description,
        isPublic,
        creator: user?.id,
      });
      onPlaylistCreated?.(newPlaylist);
      setTitle("");
      setDescription("");
      setError(null);
      onClose();
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError("Failed to create playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center">
      <div className="relative bg-zinc-900 text-white p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold">Create new playlist</h2>

        {/* Name input */}
        <div>
          <label className="block text-sm mb-1">Playlist name</label>
          <input
            className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Enter playlist name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description input */}
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            rows={2}
            className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            placeholder="Add a note for this playlist"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* IsPublic toggle */}
        <div>
          <label className="block text-sm mb-1">Public?</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isPublic"
                checked={isPublic === true}
                onChange={() => setIsPublic(true)}
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="isPublic"
                checked={isPublic === false}
                onChange={() => setIsPublic(false)}
              />
              No
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Playlist"}
        </button>
      </div>
    </div>,
    document.body
  );
}
