"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play, Shuffle, MoreHorizontal, Share2, Plus, Eye, RotateCcw,
} from "lucide-react";
import SongList from "@/components/songs/song-list";
import { useParams } from "next/navigation";
import { useMusic } from "@/context/music-context";
import OtherAlbumsSection from "@/components/album/OtherAlbumsSection";

export default function AlbumClient({ album, artist, otherAlbums = [] }) {
  const { id } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    songs,
    isPlaying,
    isShuffling,
    setContext,
    setContextId,
    playSong,
    toggleShuffle,
    updateSongsForContext,
  } = useMusic();

  // 🎯 Setup context + cache
  useEffect(() => {
    if (!id) return;

    setContext("album");
    setContextId(id);

    const cacheKey = `album_songs_${id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        updateSongsForContext("album", id, parsed);
      } catch (err) {
        console.error("Failed to parse cached songs", err);
      }
    } else {
      updateSongsForContext("album", id).then((fetched) => {
        if (Array.isArray(fetched)) {
          sessionStorage.setItem(cacheKey, JSON.stringify(fetched));
        }
      });
    }
  }, [id]);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0]);
    }
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleAddToPlaylist = () => {
    alert("⚙️ This feature is under construction.");
  };

  const handleReloadSongs = async () => {
    const fresh = await updateSongsForContext("album", id);
    if (Array.isArray(fresh)) {
      sessionStorage.setItem(`album_songs_${id}`, JSON.stringify(fresh));
    }
  };

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-4 bg-[#2f1c47] border border-purple-700 rounded-lg shadow-lg">
        <div className="relative w-64 h-64 rounded-lg overflow-hidden">
          <Image
            src={album.cover_art || "/placeholder.svg"}
            alt={album.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold text-white mb-2">{album.title}</h1>
          <p className="text-gray-300">Release Year: {album.release_year}</p>
          <p className="text-gray-300">Genre: {album.genres?.join(", ")}</p>
          <p className="text-gray-300 mb-4">
            Artist: {artist ? (
              <Link href={`/artist/${artist.id}`} className="underline hover:text-white">
                {artist.name}
              </Link>
            ) : "Loading..."}
          </p>

          {/* Controls */}
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center mt-4">
            <button
              className="bg-green-500 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-400 transition"
              onClick={handlePlayAll}
              disabled={songs.length === 0}
            >
              <Play size={20} /> Play All
            </button>

            <button
              className={`bg-gray-800 text-gray-300 px-6 py-3 rounded-full flex items-center gap-2 transition ${
                isShuffling ? "bg-green-600" : "hover:bg-gray-700"
              }`}
              onClick={toggleShuffle}
              disabled={songs.length === 0}
            >
              <Shuffle size={20} /> Shuffle
            </button>

            {/* More menu */}
            <div className="relative" ref={menuRef}>
              <button
                className={`bg-gray-800 text-gray-300 px-6 py-3 rounded-full flex items-center gap-2 transition ${
                  showMenu ? "bg-green-600" : "hover:bg-gray-700"
                }`}
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal size={20} /> More
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg py-2 z-10 border border-gray-700 origin-right">
                  <button
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    onClick={handleShare}
                  >
                    <Share2 size={18} /> Share
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    onClick={handleAddToPlaylist}
                  >
                    <Plus size={18} /> Add to Playlist
                  </button>
                  {artist && (
                    <Link
                      href={`/artist/${artist.id}`}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => setShowMenu(false)}
                    >
                      <Eye size={18} /> View Artist Details
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">Songs</h3>
            <button
              onClick={handleReloadSongs}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition"
              title="Reload songs"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {songs && songs.length > 0 ? (
          <SongList songs={songs} />
        ) : (
          <p className="text-gray-400">No songs available for this album.</p>
        )}

        {otherAlbums.length > 0 && (
          <div className="mt-8">
            <OtherAlbumsSection albums={otherAlbums} />
          </div>
        )}
      </div>
    </div>
  );
}
