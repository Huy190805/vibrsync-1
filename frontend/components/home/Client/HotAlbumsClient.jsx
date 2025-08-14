"use client";

import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { fetchAlbums } from "@/lib/api/albums";
import PlayAlbumButton from "@/components/album/play-album-button";

// Fetcher cho SWR
const fetcher = async () => {
  const albums = await fetchAlbums();
  return albums?.slice(0, 10) || [];
};

export default function HotAlbumsClient() {
  const { data: albums, isLoading, error } = useSWR("hot-albums", fetcher);

  if (isLoading || !albums) {
    // ✅ Skeleton UI giống TopArtistsClient
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Hot Albums</h2>
          <Link
            href="/viewAll/albums"
            className="text-sm font-medium text-white hover:text-purple-500 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-44 md:w-48 aspect-square bg-gray-800/30 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">🚫 Không thể tải hot albums.</div>
    );
  }

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
        {albums.map((album) => (
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
