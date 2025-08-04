// app/page.jsx
import FeaturedSection from "@/components/featured-section";
import NewReleases from "@/components/home/new-releases";
import RecommendedPlaylists from "@/components/playlist/recommended-playlists"; 
import TopArtists from "@/components/home/top-artists";
import RecommendSection from "@/components/home/recommend-section";
import ListeningHistory from "@/components/home/ListeningHistory";
import ChatBoxLauncher from "@/components/chatbot/ChatBoxLauncher";
import HotAlbums from "@/components/home/hot-albums";
import ArtistFanSection from "@/components/home/ArtistFanSection/ArtistFanSection";
import TopListenStats from "@/components/home/TopListenStats";

import { fetchTopSongs } from "@/lib/api/songs";
import { fetchAlbums } from "@/lib/api/albums";
import { fetchArtists } from "@/lib/api";
import { fetchSongs } from "@/lib/api";

export default async function Home() {
  
  const [
    topSongs,
    albums,
    artists,
    newReleases
  ] = await Promise.all([
    fetchTopSongs(20),
    fetchAlbums({ limit: 12 }),
    fetchArtists(),
    fetchSongs({ sort: "releaseYear", limit: 25 }),
  ]);

  return (
    <div className="space-y-8 pb-24">
      <FeaturedSection songs={topSongs} />
      <RecommendedPlaylists />
      <RecommendSection />
      <NewReleases songs={newReleases} />
      <TopListenStats />
      <ArtistFanSection artists={artists} />
      <ChatBoxLauncher />
      <TopArtists artists={artists} />
      <HotAlbums albums={albums} />
      <ListeningHistory />
    </div>
  );
}
