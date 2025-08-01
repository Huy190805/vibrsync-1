//app/song/[id]/SongPageClient
"use client";

import Image from "next/image";
import { useMusic } from "@/context/music-context";
import { Heart, Share2, MoreHorizontal, Play } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import SongList from "@/components/songs/song-list";
import LyricsDisplay from "@/components/lyrics/LyricsDisplay";
import LikeSongButton from "@/components/liked-button/LikeButton";
import SongActionsMenu from "@/components/songs/song-actions-menu";
import { useEffect, useState } from "react";

export default function SongPageClient({ song, artist, relatedSongs }) {
  const { playSong, currentSong } = useMusic();
  const [optionsOpenId, setOptionsOpenId] = useState(null);

  const handleLyrics = () => setOptionsOpenId(null);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/song/${song.id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("✅ Link copied!");
    }).catch(() => {
      alert("❌ Failed to copy link.");
    });
    setOptionsOpenId(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".popup-actions")) {
        setOptionsOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={song.coverArt || "/placeholder.svg"}
            alt={song.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="mb-4">
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-gray-300">{artist?.name || song.artist}</p>
            <p className="text-gray-400 mt-1">
              {song.album} • {song.releaseYear} • {formatDuration(song.duration)}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => playSong(song)}
            >
              <Play size={18} /> Play
            </button>

            <LikeSongButton songId={song.id} />

            <button className="btn-secondary flex items-center gap-2">
              <Share2 size={18} /> Share
            </button>

            <div className="relative">
              <button
                onClick={() => setOptionsOpenId(song.id)}
                className="p-2 rounded-full bg-black-700 text-white hover:bg-purple-600 transition"
              >
                <MoreHorizontal size={18} />
              </button>

              {optionsOpenId === song.id && (
                <div className="absolute z-50 mt-2 right-0 w-64 bg-zinc-800 text-white rounded shadow-lg border border-zinc-700 p-4">
                  <SongActionsMenu song={song} onClose={() => setOptionsOpenId(null)} />
                  <ul className="text-sm mt-2 space-y-2">
                    <li onClick={handleLyrics} className="hover:bg-zinc-700 rounded p-2 cursor-pointer">Lyrics</li>
                    <li onClick={handleCopyLink} className="hover:bg-zinc-700 rounded p-2 cursor-pointer">Copy Link</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">About</h3>
            <p className="text-gray-300">
              {song.description ||
                `"${song.title}" is a ${song.genre} song by ${
                  artist?.name || song.artist
                } from the album ${song.album}, released in ${song.releaseYear}.`}
            </p>
          </div>
        </div>
      </div>

      {currentSong?.id === song.id && song.lyrics_lrc && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Lyrics</h3>
          <LyricsDisplay lrc={song.lyrics_lrc} songId={song.id} />
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4">More from {artist?.name || song.artist}</h3>
        <SongList songs={relatedSongs.length ? relatedSongs : []} />
      </div>
    </div>
  );
}
