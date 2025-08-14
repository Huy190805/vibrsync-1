import Image from "next/image";
import Link from "next/link";
import { fetchArtists } from "@/lib/api";
import PlayArtistButton from "@/components/artist/play-artist-button";

export default async function TopArtists() {
  const data = await fetchArtists() || {};
  const artists = data.artists || [];
  const topArtists = artists.slice(0, 10); // Lấy top 10 nghệ sĩ

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

      <div
        className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar"
      >
        {topArtists.map((artist) => (
          <div
            key={artist.id}
            className="group relative flex-none w-40 md:w-48"
          >
            {/* Ảnh avatar */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
              <Link href={`/artist/${artist.id}`}>
                <Image
                  src={artist.image || "/placeholder.svg"}
                  alt={artist.name}
                  fill
                  className="object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-300"
                />
              </Link>

              {/* Thông tin lồng dưới ảnh */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h3 className="font-medium text-white truncate">{artist.name}</h3>
                <p className="text-xs text-gray-300 truncate">
                  {Array.isArray(artist.genres) && artist.genres.length > 0
                    ? artist.genres[0]
                    : "Unknown"}
                </p>
              </div>

              {/* Nút phát */}
              <PlayArtistButton artistId={artist.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
