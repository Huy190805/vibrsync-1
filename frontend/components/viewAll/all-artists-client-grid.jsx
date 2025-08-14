"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music4 } from "lucide-react";

export default function AllArtistsClientGrid({ artists }) {
  const [activeArtistId, setActiveArtistId] = useState(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-8">
      {artists.map((artist) => (
        <div key={artist.id} className="group text-center space-y-4">
          {/* Ảnh nghệ sĩ */}
          <div
            className={`relative w-52 h-52 mx-auto rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
              activeArtistId === artist.id ? "ring-4 ring-white" : ""
            }`}
            onClick={() => setActiveArtistId(artist.id)}
          >
            <Link href={`/artist/${artist.id}`}>
              <Image
                src={artist.image || "/placeholder.svg"}
                alt={artist.name}
                fill
                className="object-cover"
              />
            </Link>
          </div>

          {/* Tên + genre */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Music4
                size={18}
                className="text-white group-hover:text-[#00FFC6] transition-colors duration-300"
              />
              <h3 className="text-white font-semibold truncate max-w-[200px]">
                {artist.name}
              </h3>
            </div>
            <p className="text-sm text-gray-400">
              {Array.isArray(artist.genres) && artist.genres.length > 0
                ? artist.genres[0]
                : "Unknown"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
