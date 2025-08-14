import Image from "next/image";
import Link from "next/link";
import { fetchAlbums } from "@/lib/api/albums";
import PlayAlbumButton from "@/components/album/play-album-button"; // Client Component nhỏ

export default async function HotAlbums() {
  const albums = await fetchAlbums({ limit: 12 }) || [];
  const topAlbums = albums.slice(0, 10); // lấy tối đa 10 album

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/viewAll/albums"
            className="text-2xl font-bold text-white hover:text-purple-500 transition-colors"
          >
            Hot Albums
          </Link>
        </div>
        <Link
          href="/viewAll/albums"
          className="text-sm font-medium text-white hover:text-purple-500 transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Scrollable Album List */}
      <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
        {topAlbums.map((album) => (
          <div
            key={album.id}
            className="relative group flex-none w-44 md:w-48"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
              <Link href={`/album/${album.id}`}>
                <Image
                  src={album.cover_art || "/placeholder.svg"}
                  alt={album.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Nút phát nhạc */}
              <PlayAlbumButton albumId={album.id} />
            </div>

            <h3 className="text-sm font-medium text-center text-white truncate mt-2">{album.title}</h3>
            <p className="text-xs text-gray-400 text-center">{album.release_year}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
