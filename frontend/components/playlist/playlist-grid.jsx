"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";

export default function PlaylistGrid({ playlists }) {
  const { user } = useAuth();

  // Nếu chưa có user thì không hiển thị gì
  if (!user?.id) {
    return <p className="text-gray-400">No playlists available</p>;
  }

  // Chỉ lấy playlist thuộc về user hiện tại
  const myPlaylists = playlists?.filter(
    (playlist) => playlist.creator === user.id || playlist.userId === user.id
  ) || [];

  if (myPlaylists.length === 0) {
    return <p className="text-gray-400">No playlists available</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {myPlaylists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/playlist/${playlist.slug || playlist.id}`}
          className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
        >
          <div className="relative w-full h-48">
            <Image
              src={playlist.coverArt || "/placeholder.svg"}
              alt={playlist.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-white truncate">{playlist.title}</h3>
            <p className="text-gray-400 text-sm">
              By {playlist.creatorName || playlist.creator}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
