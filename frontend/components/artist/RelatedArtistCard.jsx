"use client";

import Link from "next/link";
import Image from "next/image";

export const RelatedArtistCard = ({ artist }) => (
  <Link href={`/artist/${artist._id || artist.id || "default"}?from=youmaylike`}>
    <div className="bg-gray-800/50 p-4 rounded-lg text-center hover:bg-gray-700/50 transition-transform duration-300 transform hover:scale-105">
      <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden shadow-md">
        <Image
          src={artist.image || "/placeholder.svg"}
          alt={artist.name || "Artist image"}
          fill
          className="object-cover"
        />
      </div>
      <h4 className="text-base font-semibold mt-3 text-white">{artist.name || "Unknown Artist"}</h4>
      <p className="text-xs text-gray-400">{artist.genres?.join(", ") || "No genres"}</p>
    </div>
  </Link>
);
