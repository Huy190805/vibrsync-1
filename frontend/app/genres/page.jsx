"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { genreTitles } from "@/components/genres/dataGenres";

// Tải động các component để tối ưu tốc độ tải trang
const MoodAndActivitySection = dynamic(() => import("@/components/genres/MoodAndActivitySection"), {
  ssr: false, // Tắt server-side rendering để giảm tải ban đầu
});
const GenreSection = dynamic(() => import("@/components/genres/GenreSection"), { ssr: false });

// Trang chính hiển thị các section Mood & Activity và Genres
export default function GenresPage() {
  return (
    <div className="min-h-screen px-6 py-10 space-y-20 text-white bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1f]">
      {/* Section Mood & Activity với Suspense để hiển thị spinner khi tải */}
      <Suspense
        fallback={
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading Mood & Activity ...</p>
          </div>
        }
      >
        <MoodAndActivitySection />
      </Suspense>

      {/* Lặp qua các thể loại để hiển thị từng section Genres */}
      {genreTitles.map((genreTitle) => (
        <Suspense
          key={genreTitle}
          fallback={
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading {genreTitle}...</p>
            </div>
          }
        >
          <GenreSection genreTitle={genreTitle} />
        </Suspense>
      ))}
    </div>
  );
}