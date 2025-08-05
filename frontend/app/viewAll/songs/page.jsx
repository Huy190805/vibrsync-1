// frontend/app/viewall/song/page.jsx
"use client";

import { Music3 } from "lucide-react";
import AllSongsSection from "@/components/viewAll/AllSongsSection";

export default function AllSongsPage() {
  return (
    <div
      className="px-4 py-6 sm:px-8 sm:py-10 space-y-8 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen overflow-y-scroll scrollbar-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#39FF14]/30 pb-4">
        <div className="flex items-center gap-3 text-white">
          <Music3 size={28} className="text-[#39FF14]" />
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#39FF14] to-[#99FFFF] text-transparent bg-clip-text">
            Explore All Songs
          </h2>
        </div>
      </div>

      {/* Danh sách bài hát */}
      <div className="bg-[#121212] rounded-2xl shadow-md p-4 sm:p-6 border border-[#39FF14]/10">
        <AllSongsSection />
      </div>
    </div>
  );
}
