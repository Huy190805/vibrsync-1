import GenresPageClient from "./GenresPageClient";
import NewReleases from "@/components/home/new-releases";
import PublicPlaylistsSection from "@/components/playlist/PublicPlaylistsSection";

export default function GenresPage() {
  return (
    <div>
      <GenresPageClient /> {/* Đây là Client Component */}
      <div className="mt-2 px-6">
        <NewReleases /> 
        <PublicPlaylistsSection />
      </div>
    </div>
  );
}
