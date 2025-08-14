"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreatePlaylistModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "A new playlist",
          coverArt: "https://via.placeholder.com/640x640.png?text=Playlist+Cover",
          songIds: [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onCreated?.(data.id); // Trả lại ID playlist mới
        onClose();
      } else {
        alert(data.detail || "Failed to create playlist");
      }
    } catch (err) {
      console.error("Error creating playlist:", err);
      alert("Error creating playlist");
    } finally {
      setLoading(false);
      setTitle("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="bg-zinc-900 p-6 rounded-lg max-w-sm w-full mx-auto mt-20 space-y-4">
        <h2 className="text-lg font-semibold text-white">Create New Playlist</h2>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Playlist name"
        />
        <Button disabled={loading || !title.trim()} onClick={handleCreate}>
          {loading ? "Creating..." : "Create Playlist"}
        </Button>
        <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
          Cancel
        </Button>
      </div>
    </Dialog>
  );
}
