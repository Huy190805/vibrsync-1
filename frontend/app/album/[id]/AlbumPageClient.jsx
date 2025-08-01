// components/album/AlbumPageClient.jsx
"use client";

import { useState } from "react";
import useAlbumDetail from "@/components/album/useAlbumDetail";
import AlbumHeader from "@/components/album/AlbumHeader";
import SongSection from "@/components/album/SongSection";
import OtherAlbumsSection from "@/components/album/OtherAlbumsSection";
import AlbumToast from "@/components/album/AlbumToast";

export default function AlbumPageClient({ initialData }) {
  const [toast, setToast] = useState(null);
  const { album, artist, songs, artistAlbums, loading, error, isFromOtherAlbums } = useAlbumDetail(initialData);

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto p-6">
        <div className="h-64 bg-[#2A2A2A]/60 rounded-xl animate-pulse" /> {/* Skeleton cho AlbumHeader */}
        <div className="h-96 bg-[#2A2A2A]/60 rounded-xl animate-pulse" /> {/* Skeleton cho SongSection */}
        {!isFromOtherAlbums && (
          <div className="h-48 bg-[#2A2A2A]/60 rounded-xl animate-pulse" /> /* Skeleton cho OtherAlbumsSection */
        )}
      </div>
    );
  }

  if (error || !album) {
    setToast(error || "Album not found");
    return (
      <div className="text-red-500 text-center py-24">
        {error || "Album not found"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AlbumToast message={toast} />
      <AlbumHeader album={album} artist={artist} songs={songs} setToast={setToast} />
      <SongSection songs={songs} setToast={setToast} />
      {!isFromOtherAlbums && <OtherAlbumsSection albums={artistAlbums} />}
    </div>
  );
}