"use client";

import Image from "next/image";
import Link from "next/link";
import { Disc } from "lucide-react";

export default function ArtistAlbums({ albums = [] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Disc size={24} className="text-green-500" /> Albums
        </h3>

      </div>
      {albums.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album, index) => (
            <div
              key={album._id || `album-${index}`}
              className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-700/50 transition-transform duration-300 transform hover:scale-105"
            >
              <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-md">
              <Link href={`/album/${album.id}`}>
                <Image
                  src={album.cover_art || "/placeholder.svg"}
                  alt={album.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              </div>
              <h4 className="text-base font-semibold mt-3">{album.title}</h4>
              <p className="text-xs text-gray-400">{album.releaseYear}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No albums available for this artist.</p>
      )}
    </div>
  );
}