"use client";

import MoodAndActivitySection from "@/components/genres/MoodAndActivitySection";
import GenreSection from "@/components/genres/GenreSection";
import { genreTitles } from "@/components/genres/dataGenres";

export default function BrowsePage() {
  return (
    <div className="px-4 md:px-10 pt-4 pb-8"> 
      
      {/* Tiêu đề Browse all */}
      <div className="mb-3">
        <h1 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-left text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 tracking-tight">
          Browse all
        </h1>
      </div>

      {/* Mood & Activity */}
      <div className="mt-0"> 
        <MoodAndActivitySection hideTitle={true} />
      </div>

      {/* Thể loại */}
      {genreTitles.map((title, index) => (
        <div key={index} className="mt-10"> 
          <GenreSection genreTitle={title} hideTitle={true} />
        </div>
      ))}
    </div>
  );
}
