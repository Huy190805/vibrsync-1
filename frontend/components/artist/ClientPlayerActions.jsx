"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play, Shuffle, MoreHorizontal,
  Share2, Plus, Eye, Heart
} from "lucide-react";
import { useMusic } from "@/context/music-context";
import {
  followArtist,
  unfollowArtist,
  fetchArtistById
} from "@/lib/api/artists";

export default function ClientPlayerActions({ artist, songs, from }) {
  const [isFollowing, setIsFollowing] = useState(artist?.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(artist?.followerCount || 0);
  const [showMenu, setShowMenu] = useState(false);

  const {
    setSongs,
    setContext,
    setContextId,
    playSong,
    toggleShuffle,
    isShuffling
  } = useMusic();

  // Refresh isFollowing and followerCount after mount
  useEffect(() => {
    async function fetchFreshFollowState() {
      try {
        const updated = await fetchArtistById(artist.id || artist._id);
        setIsFollowing(updated.isFollowing);
        setFollowerCount(updated.followerCount);
      } catch (error) {
        console.error("❌ Failed to refresh artist info:", error);
      }
    }
    fetchFreshFollowState();
  }, [artist.id]);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setSongs(songs);
      setContext("artist");
      setContextId(artist.id || artist._id);
      setTimeout(() => playSong(songs[0]), 0);
    }
  };

  const handleToggleFollow = async () => {
    const artistId = artist?.id || artist?._id;
    if (!artistId) return;

    try {
      if (isFollowing) {
        await unfollowArtist(artistId);
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(prev - 1, 0));
      } else {
        await followArtist(artistId);
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("❌ Error toggle follow:", err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("Link copied!"))
      .catch(err => console.error("Clipboard error:", err));
  };

  const handleAddToPlaylist = () => {
    alert("⚙️ Add to playlist coming soon.");
  };

  return (
    <div className="mt-4 flex flex-wrap gap-4 items-center">
      <div className="text-sm text-gray-400 ml-2">
        Followers:{" "}
        <span className="text-white font-semibold">
          {followerCount.toLocaleString()}
        </span>
      </div>

      <button
        onClick={handlePlayAll}
        className="bg-green-500 text-black font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-400"
      >
        <Play size={20} /> Play All
      </button>

      <button
        onClick={toggleShuffle}
        className={`px-6 py-3 rounded-full flex items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105 ${
          isShuffling
            ? "bg-green-600 text-white"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        <Shuffle size={20} /> Shuffle
      </button>

      <button
        onClick={handleToggleFollow}
        className={`px-6 py-3 rounded-full flex items-center gap-2 transition-colors duration-300 ${
          isFollowing
            ? "bg-green-600 text-white hover:bg-green-400"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        {isFollowing ? (
          <>
            <Heart size={20} fill="currentColor" /> Following
          </>
        ) : (
          <>
            <Heart size={20} /> Follow
          </>
        )}
      </button>

      <div className="relative">
        <button
          onClick={() => setShowMenu(prev => !prev)}
          className={`px-6 py-3 rounded-full flex items-center gap-2 ${
            showMenu ? "bg-green-600" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <MoreHorizontal size={20} /> More
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
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
            <Link
              href={`/artist/${artist.id || artist._id}`}
              className="block px-4 py-2 hover:bg-gray-700 text-sm text-gray-300"
              onClick={() => setShowMenu(false)}
            >
              <Eye size={18} className="inline-block mr-2" />
              View Artist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
