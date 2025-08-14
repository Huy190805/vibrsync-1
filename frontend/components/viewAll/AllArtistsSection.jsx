import { fetchArtists } from "@/lib/api";
import AllArtistsClientGrid from "./all-artists-client-grid";

export default async function AllArtistsSection() {
  const data = await fetchArtists();
  const artists = data?.artists || [];

  if (artists.length === 0) {
    return <p className="text-white">No artists found.</p>;
  }

  return (
    <section className="w-full space-y-8">
      <AllArtistsClientGrid artists={artists} />
    </section>
  );
}
