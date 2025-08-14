"use client";

import Image from "next/image";
import { Heart, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMusic } from "@/context/music-context";

export default function SongCardList({ songs = [], onPlay }) {
  const { currentSong, isPlaying } = useMusic();
  const [likedSongs, setLikedSongs] = useState(new Set());

  const toggleLike = (id) => {
    const updated = new Set(likedSongs);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setLikedSongs(updated);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {songs.map((song) => {
        const isLiked = likedSongs.has(song.id);
        const isCurrent = currentSong?.id === song.id;

        return (
          <div
            key={song.id}
            className="group relative bg-zinc-800 rounded-lg p-3 transition hover:bg-zinc-700"
          >
            {/* Ảnh bài hát */}
            <div className="relative w-full aspect-square rounded overflow-hidden">
              <Image
                src={song.coverArt || "/placeholder.svg"}
                alt={song.title}
                fill
                className="object-cover"
              />
              {/* Nút phát */}
              <button
                onClick={() => onPlay(song)}
                className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <Play size={16} />
              </button>
            </div>

            {/* Thông tin */}
            <div className="mt-3">
              <Link href={`/song/${song.id}`} className="font-medium text-white truncate block hover:underline">
                {song.title}
              </Link>
              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
            </div>

            {/* Like */}
            <button
              onClick={() => toggleLike(song.id)}
              className="absolute top-2 right-2 text-gray-300 hover:text-pink-500"
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
