"use client";

import { useEffect, useState } from "react";
import SongList from "@/components/songs/song-list";
import ArtistCard from "@/components/artist/ArtistCard";

// Add API_BASE definition
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LikedPage() {
  const [likedSongs, setLikedSongs] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kiểm tra sessionStorage
        const cachedSongs = sessionStorage.getItem("liked_songs");
        const cachedArtists = sessionStorage.getItem("followed_artists");

        if (cachedSongs && cachedArtists) {
          setLikedSongs(JSON.parse(cachedSongs));
          setFollowedArtists(JSON.parse(cachedArtists));
          setLoading(false);
          return;
        }

        const [songsRes, artistsRes] = await Promise.all([
          fetch(`${API_BASE}/user/me/liked-songs`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`${API_BASE}/user/me/following`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        if (!songsRes.ok || !artistsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const songsData = await songsRes.json();
        const artistsData = await artistsRes.json();

        const likedSongsData = songsData.liked || [];
        const followedArtistsData = artistsData.following || [];

        setLikedSongs(likedSongsData);
        setFollowedArtists(followedArtistsData);

        // Lưu vào sessionStorage
        sessionStorage.setItem("liked_songs", JSON.stringify(likedSongsData));
        sessionStorage.setItem("followed_artists", JSON.stringify(followedArtistsData));
      } catch (err) {
        console.error("Error:", err);
        setError("Could not load liked songs or followed artists.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Lắng nghe sự kiện cập nhật danh sách (ví dụ: khi thích/bỏ thích bài hát, theo dõi/bỏ theo dõi nghệ sĩ)
  useEffect(() => {
    const handleUpdate = () => {
      // Xóa cache khi có cập nhật
      sessionStorage.removeItem("liked_songs");
      sessionStorage.removeItem("followed_artists");
      fetchData(); // Gọi lại API để làm mới dữ liệu
    };

    window.addEventListener("likedSongsUpdated", handleUpdate);
    window.addEventListener("followedArtistsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("likedSongsUpdated", handleUpdate);
      window.removeEventListener("followedArtistsUpdated", handleUpdate);
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="p-6 space-y-12 text-white">
      <section>
        <h2 className="text-2xl font-bold mb-4">❤️ Liked Songs</h2>
        {likedSongs.length > 0 ? (
          <SongList songs={likedSongs} />
        ) : (
          <p className="text-gray-400">No liked songs yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">⭐ Followed Artists</h2>
        {followedArtists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {followedArtists.map((artist) => (
              <ArtistCard key={artist.id || artist._id} artist={artist} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You haven't followed any artists yet.</p>
        )}
      </section>
    </div>
  );
}