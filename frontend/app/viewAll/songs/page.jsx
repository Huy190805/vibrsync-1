// ✅ frontend/app/viewAll/songs/page.jsx
"use client";

"use client";

import { Music3 } from "lucide-react"; // ✅ Sửa từ Waveform thành Music3
import AllSongsSection from "@/components/viewAll/AllSongsSection";

export default function AllSongsPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Tiêu đề với biểu tượng thú vị */}
      <div className="flex items-center justify-between border-b border-[#39FF14]/20 pb-4">
        <div className="flex items-center gap-3 text-white">
          <Music3 size={28} className="text-[#99FFFF]" />
          <h2 className="text-3xl font-bold">Explore All Songs</h2>
        </div>
        {/* Gọi section hiển thị danh sách bài hát */}
      </div>
       <AllSongsSection />
    </div>
  );
}
