"use client";

import { useEffect } from "react";
import Link from "next/link";
import SongList from "@/components/songs/song-list";
import PlayNewReleasesClient from "@/components/home/play-new-releases-client";

export default function NewReleasesClient({ songs }) {
  const newReleases = Array.isArray(songs) ? songs : [];

  // ✅ Save to localStorage on mount
  useEffect(() => {
    if (newReleases.length > 0) {
      localStorage.setItem("newReleases", JSON.stringify(newReleases));
    }
  }, [newReleases]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/viewAll/songs"
            className="text-2xl font-bold text-white hover:text-purple-600 transition-colors"
          >
            New Releases
          </Link>
          <PlayNewReleasesClient songs={newReleases} />
        </div>

        <Link
          href="/viewAll/songs"
          className="text-sm font-medium text-white hover:text-purple-600 transition-colors"
        >
          View All
        </Link>
      </div>

      {newReleases.length > 0 ? (
        <SongList
          songs={newReleases}
          enablePlayContext
          contextName="new-releases"
        />
      ) : (
        <p className="text-gray-400">Không có bài hát mới nào</p>
      )}
    </section>
  );
}
