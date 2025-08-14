"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import axios from "axios";

export default function LikePlaylistButton({ playlistId }) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLike = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:8000/api/likes/playlist/is-liked/${playlistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(res.data.isLiked);
      } catch (err) {
        console.error("❌ Failed to check playlist like:", err);
      }
    };
    fetchLike();
  }, [playlistId]);

  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (isLiked) {
        await axios.post(`http://localhost:8000/api/likes/playlist/${playlistId}/unlike`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
      } else {
        await axios.post(`http://localhost:8000/api/likes/playlist/${playlistId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
      }
    } catch (err) {
      console.error("❌ Toggle playlist like failed:", err);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={`hover:text-pink-400 transition-colors ${
        isLiked ? "text-pink-500" : "text-white"
      }`}
    >
      <Heart className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
    </button>
  );
}