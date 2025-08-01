"use client";

import { useEffect, useState } from "react";
import SongList from "@/components/songs/song-list";
import ArtistCard from "@/components/artist/ArtistCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LikedPage() {
  const [likedSongs, setLikedSongs] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);

  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);

  const [errorSongs, setErrorSongs] = useState("");
  const [errorArtists, setErrorArtists] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const fetchLikedSongs = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/me/liked-songs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setLikedSongs(data.liked || []);
      } catch (err) {
        console.error("Failed to fetch liked songs:", err);
        setErrorSongs("Could not load liked songs.");
      } finally {
        setLoadingSongs(false);
      }
    };

    const fetchFollowedArtists = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/me/following`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFollowedArtists(data.following || []);
      } catch (err) {
        console.error("Failed to fetch followed artists:", err);
        setErrorArtists("Could not load followed artists.");
      } finally {
        setLoadingArtists(false);
      }
    };

    fetchLikedSongs();
    fetchFollowedArtists();
  }, []);

  return (
    <div className="p-6 space-y-12 text-white">
      {/* Liked Songs Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">❤️ Liked Songs</h2>
        {loadingSongs ? (
          <p className="text-gray-400">Loading liked songs...</p>
        ) : errorSongs ? (
          <p className="text-red-400">{errorSongs}</p>
        ) : likedSongs.length > 0 ? (
          <SongList songs={likedSongs} />
        ) : (
          <p className="text-gray-400">No liked songs yet.</p>
        )}
      </section>

      {/* Followed Artists Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">⭐ Followed Artists</h2>
        {loadingArtists ? (
          <p className="text-gray-400">Loading followed artists...</p>
        ) : errorArtists ? (
          <p className="text-red-400">{errorArtists}</p>
        ) : followedArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {followedArtists.map((artist) => (
              <ArtistCard key={artist._id || artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You haven't followed any artists yet.</p>
        )}
      </section>
    </div>
  );
}
