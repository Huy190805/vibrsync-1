import Image from "next/image";
import Link from "next/link";
import { Headphones, Music4, Orbit } from "lucide-react"; // ✅ Icon tuỳ chỉnh

export default function OtherAlbumsSection({ albums }) {
  // Nếu không có dữ liệu album thì không render
  if (!albums || albums.length === 0) return null;

  return (
    <div className="relative mt-12 px-6 py-8 rounded-2xl bg-[#1f1f1f]/80 border border-[#39FF14]/20 shadow-2xl backdrop-blur-md space-y-6">
      
      {/* ==== Tiêu đề và nút View All ==== */}
      <div className="flex items-center justify-between text-white mb-4">
        <div className="flex items-center gap-3">
          <Orbit size={24} className="text-[#39FF14]" /> {/* ✅ Icon tiêu đề */}
          <h3 className="text-2xl font-bold">Other Albums You Might Like</h3>
        </div>
        <Link
          href="/viewAll/albums"
          className="text-sm font-medium text-[#39FF14] hover:underline hover:text-white transition-colors"
        >
          View All
        </Link>
      </div>

      {/* ==== Danh sách album ==== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}?from=other`}
            className="group bg-[#2A2A2A]/60 hover:bg-[#39FF14]/10 rounded-xl border border-[#39FF14]/10 hover:border-[#39FF14]/40 shadow-md hover:shadow-[#39FF14]/30 transition-all duration-300 overflow-hidden"
          >
            {/* ==== Ảnh album và icon trạng thái ==== */}
            <div className="relative w-full h-44 overflow-hidden">
              <Image
                src={album.cover_art || "/placeholder.svg"}
                alt={album.title}
                fill
                className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl" />

              {/* Icon góc phải trên ảnh */}
              <div className="absolute top-2 right-2 z-10">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 transition-all group-hover:bg-[#39FF14]/20">
                  {/* Icon đổi màu khi hover */}
                  <Music4
                    size={18}
                    className="text-white group-hover:text-[#00FFCC] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ==== Thông tin album dưới ảnh ==== */}
            <div className="p-4 text-center space-y-1">
              <h4
                className="text-white font-semibold text-base truncate"
                title={album.title}
              >
                {album.title}
              </h4>
              <p className="text-sm text-gray-400">
                {album.release_year ? `Year: ${album.release_year}` : "Unknown Year"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
