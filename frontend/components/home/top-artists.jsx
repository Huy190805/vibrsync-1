// File: components/home/top-artists.jsx
import Image from "next/image";
import Link from "next/link";
import PlayArtistButton from "@/components/artist/play-artist-button";

export default function TopArtists({ artists }) {
  const artistsArray = Array.isArray(artists) ? artists : artists?.artists || [];
  const topArtists = artistsArray.slice(0, 10);

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
        {topArtists.map((artist) => (
          <div key={artist.id} className="group relative flex-none w-40 md:w-48">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
              <Link href={`/artist/${artist.id}`}>
                <Image
                  src={artist.image || "/placeholder.svg"}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className="object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-300"
                />
              </Link>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h3 className="font-medium text-white truncate">{artist.name}</h3>
                <p className="text-xs text-gray-300 truncate">
                  {Array.isArray(artist.genres) && artist.genres.length > 0
                    ? artist.genres[0]
                    : "Unknown"}
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
