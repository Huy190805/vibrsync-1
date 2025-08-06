"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Play, Shuffle, MoreHorizontal, Share2, Plus, Eye, RotateCcw,
} from "lucide-react";

import { fetchAlbumById } from "@/lib/api/albums";
import { fetchArtistById } from "@/lib/api/artists";
import SongList from "@/components/songs/song-list";
import { useMusic } from "@/context/music-context";

export default function AlbumDetailPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    songs,
    currentSong,
    isPlaying,
    isShuffling,
    repeatMode,
    setContext,
    setContextId,
    playSong,
    togglePlayPause,
    toggleShuffle,
    toggleRepeat,
    nextSong,
    prevSong,
    updateSongsForContext,
  } = useMusic();

  useEffect(() => {
    if (!id) return;

    const loadAlbum = async () => {
      setLoading(true);
      try {
        const albumData = await fetchAlbumById(id);
        if (!albumData) throw new Error("Album not found");

        setAlbum(albumData);
        setContext("album");
        setContextId(albumData._id);

        if (albumData.artist_id) {
          const artistData = await fetchArtistById(albumData.artist_id);
          setArtist(artistData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlayAll = () => {
    if (songs?.length > 0) {
      playSong(songs[0]);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("Link copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };

  const handleAddToPlaylist = () => {
    alert("⚙️ This feature is under construction.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-gray-900">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-green-500 rounded-full" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500">
        {error || "Album not found"} (ID: {id})
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-4 bg-gray-900 rounded-lg shadow-lg">
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
              <Link href={`/artist/${artist._id}`} className="underline hover:text-white">
                {artist.name}
              </Link>
            ) : "Loading..."}
          </p>

          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center mt-4">
            <button
              className="bg-green-500 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-400 transition"
              onClick={handlePlayAll}
              disabled={songs.length === 0}
            >
              <Play size={20} /> Play All
            </button>

            <button
              className={`bg-gray-800 text-gray-300 px-6 py-3 rounded-full flex items-center gap-2 transition ${isShuffling ? "bg-green-600" : "hover:bg-gray-700"}`}
              onClick={toggleShuffle}
              disabled={songs.length === 0}
            >
              <Shuffle size={20} /> Shuffle
            </button>

            <div className="relative" ref={menuRef}>
              <button
                className={`bg-gray-800 text-gray-300 px-6 py-3 rounded-full flex items-center gap-2 transition ${showMenu ? "bg-green-600" : "hover:bg-gray-700"}`}
                onClick={() => setShowMenu((prev) => !prev)}
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
                      href={`/artist/${artist._id}`}
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
              onClick={() => updateSongsForContext("album", id)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition"
              title="Reload songs"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {songs?.length > 0 ? (
          <SongList songs={songs} />
        ) : (
          <p className="text-gray-400">No songs available for this album.</p>
        )}
      </div>
    </div>
  );
}
