import { Sparkles } from "lucide-react";
import AllArtistsSection from "@/components/viewAll/AllArtistsSection";

export default function AllArtistsPage() {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Tiêu đề với biểu tượng độc đáo */}
      <div className="flex items-center gap-3 text-white">
        <Sparkles size={28} className="text-[#99FFFF]" />
        <h2 className="text-3xl font-bold">Explore All Artists</h2>
      </div>

      {/* Gọi section hiển thị danh sách nghệ sĩ */}
      <AllArtistsSection />
    </div>
  );
}
