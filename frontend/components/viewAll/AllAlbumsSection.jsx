import { fetchAlbums } from "@/lib/api/albums";
import AllAlbumsClientGrid from "./all-albums-client-grid";

export default async function AllAlbumsSection() {
  const albums = await fetchAlbums() || [];

  if (!albums || albums.length === 0) {
    return <p className="text-white">No albums found.</p>;
  }

  return (
    <section className="space-y-8">
      <AllAlbumsClientGrid albums={albums} />
    </section>
  );
}
