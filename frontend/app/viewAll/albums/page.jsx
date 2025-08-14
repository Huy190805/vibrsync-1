import { fetchAlbums } from "@/lib/api/albums";
import AllAlbumsClientGrid from "@/components/viewAll/all-albums-client-grid";
import { Waves } from "lucide-react";

export default async function ViewAllAlbumsPage() {
  const albums = await fetchAlbums(); // Gọi API trên server

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tiêu đề + icon */}
      <div className="flex items-center gap-3 mb-6">
        <Waves size={28} className="text-[#00FFCC]" />
        <h1 className="text-3xl font-bold text-white">Explore All Albums</h1>
      </div>

      {/* Giao diện hiển thị danh sách albums */}
      <AllAlbumsClientGrid albums={albums} />
    </div>
  );
}
