"use client";

import { useEffect, useState, Suspense } from "react";
import ArtistFanSectionClient from "./ArtistFanSectionClient";
import { fetchArtists } from "@/lib/api/artists";

export default function ArtistFanSection() {
  const [mappedArtists, setMappedArtists] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const cached = localStorage.getItem("artist_fan_cache");

    if (cached) {
      const parsed = JSON.parse(cached);
      setMappedArtists(parsed);
      setCurrentIndex(Math.floor(Math.random() * parsed.length));
      return;
    }

    const loadArtists = async () => {
      try {
        const artistsData = await fetchArtists({ cache: "force-cache" });
        const artistsArray = Array.isArray(artistsData)
          ? artistsData
          : artistsData.artists || [];

        const mapped = artistsArray.map((artist) => ({
          id: artist._id || crypto.randomUUID(),
          name: artist.name || "Nghệ sĩ không xác định",
          avatar: artist.thumbnail || artist.image || "https://via.placeholder.com/80",
          followers: artist.followers
            ? `${(artist.followers / 1_000_000).toFixed(1)}M`
            : "0M",
        }));

        localStorage.setItem("artist_fan_cache", JSON.stringify(mapped));
        setMappedArtists(mapped);
        setCurrentIndex(Math.floor(Math.random() * mapped.length));
      } catch (error) {
        console.error("Lỗi tải dữ liệu nghệ sĩ:", error);
        setMappedArtists([]);
      }
    };

    loadArtists();
  }, []);

  // 👉 Spinner khi đang tải
  if (mappedArtists === null) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 👉 Khi không có nghệ sĩ nào
  if (!mappedArtists.length) {
    return (
      <div className="text-red-500 text-center text-lg">
        Không tìm thấy nghệ sĩ nào!
      </div>
    );
  }

  // 👉 Khi đã có dữ liệu nghệ sĩ
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ArtistFanSectionClient
        initialArtists={mappedArtists}
        initialArtistIndex={currentIndex}
      />
    </Suspense>
  );
}
