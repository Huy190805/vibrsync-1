// frontend/components/albums/AlbumToast.jsx
"use client";

// ======= Import icon cần thiết =======
import { Star } from "lucide-react";

// ======= Component hiển thị thông báo ngắn khi người dùng thực hiện hành động =======
export default function AlbumToast({ message }) {
  // Nếu không có nội dung message thì không render gì cả
  if (!message) return null;

  return (
    <div
      className="absolute right-0 top-0 mt-4 mr-4 z-10 px-4 py-2 bg-[#2A2A2A] text-white text-sm rounded-lg shadow-md flex items-center gap-2 animate-fade-in"
    >
      {/* Icon ở đầu thông báo */}
      <Star size={16} className="text-[#39FF14]" />

      {/* Nội dung thông báo từ props truyền vào */}
      {message}
    </div>
  );
}
