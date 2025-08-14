"use client";

import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { fetchArtists } from "@/lib/api";
import PlayArtistButton from "@/components/artist/play-artist-button";

// Fetcher cho SWR
const fetcher = async () => {
  const data = await fetchArtists(10); // Giới hạn 10 nghệ sĩ
  return data.artists || [];
};

export default function TopArtistsClient() {
  const { data: artists, isLoading, error } = useSWR("top-artists", fetcher);

  if (isLoading || !artists) {
    // ✅ Skeleton loading UI
    return (
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Top Artists</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-40 md:w-48 aspect-[3/4] bg-gray-800/30 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-red-500">🚫 Không thể tải nghệ sĩ.</div>;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Top Artists</h2>
        <Link
          href="/viewAll/artists"
          className="text-sm font-medium text-white hover:text-purple-600 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="group relative flex-none w-40 md:w-48"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
              <Link href={`/artist/${artist.id}`}>
                <Image
                  src={artist.image || "/placeholder.svg"}
                  alt={artist.name}
                  fill
                  className="object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-300"
                />
              </Link>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h3 className="font-medium text-white truncate">{artist.name}</h3>
                <p className="text-xs text-gray-300 truncate">
                  {artist.genres?.[0] || "Unknown"}
                </p>
              </div>

              <PlayArtistButton artistId={artist.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
