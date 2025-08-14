"use client";

import dynamic from "next/dynamic";

const ArtistFanSection = dynamic(
  () => import("../ArtistFanSection/ArtistFanSection"),
  {
    ssr: false,
    loading: () => <div className="text-white">👥 Đang tải Artist Fan Section...</div>,
  }
);

export default function ArtistFanSectionClient() {
  return <ArtistFanSection />;
}
