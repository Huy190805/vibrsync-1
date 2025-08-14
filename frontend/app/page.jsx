
import RecommendSection from "@/components/home/recommend-section";

// Import từ các Client wrapper component (đã dynamic + ssr: false)
import FeaturedSectionClient from "@/components/home/Client/FeaturedSectionClient";
import ArtistFanSection from "@/components/home/ArtistFanSection/ArtistFanSection";
import HotAlbumsClient from "@/components/home/Client/HotAlbumsClient";
import TopArtistsClient from "@/components/home/Client/TopArtistsClient";
import TopListenStats from "@/components/home/TopListenStats";
import ListeningHistory from "@/components/home/ListeningHistory";

export default function HomePage() {
  return (
    <div className="space-y-8 pb-24">
      {/* Static sections */}
       <FeaturedSectionClient />
      <RecommendSection />

      {/* Lazy-loaded sections */}
      <ArtistFanSection/>
      <TopArtistsClient />
      
      <TopListenStats />
      <HotAlbumsClient />
      <ListeningHistory />
    </div>
  );
}
