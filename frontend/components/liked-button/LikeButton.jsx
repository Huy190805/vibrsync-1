"use client"
import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import axios from "axios"

export default function LikeButton({ songId, className = "" }) {
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const checkLiked = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/likes/is-liked/${songId}`, {

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setIsLiked(res.data.isLiked)
      } catch (e) {
        console.error("Failed to check like:", e)
      }
    }
    checkLiked()
  }, [songId])

  const toggleLike = async () => {
    try {
      if (isLiked) {
        await axios.post(`http://localhost:8000/api/likes/${songId}/unlike`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setIsLiked(false)
      } else {
        await axios.post(`http://localhost:8000/api/likes/${songId}/like`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setIsLiked(true)
      }
    } catch (e) {
      console.error("Toggle like failed:", e)
    }
  }

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-2 transition-colors duration-300 ${isLiked ? "text-purple-500 hover:text-purple-400" : "text-gray-400 hover:text-purple-400"} ${className}`}
    >
      <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
    </button>

  )
}