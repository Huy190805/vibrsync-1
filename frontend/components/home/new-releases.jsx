// File: components/home/new-releases.jsx
import Link from "next/link";
import SongList from "@/components/songs/song-list.jsx";
import PlayNewReleasesClient from "./play-new-releases-client";

export default function NewReleases({ songs }) {
  const newReleases = Array.isArray(songs) ? songs : [];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        {/* Title + Play All */}
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
        <p className="text-gray-400">No new releases available</p>
      )}
    </section>
  );
}
