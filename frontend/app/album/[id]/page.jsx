// app/album/[id]/page.jsx
import AlbumClient from "./AlbumPageClient";
import { fetchAlbumById, fetchAlbums } from "@/lib/api/albums";
import { fetchArtistById } from "@/lib/api/artists";

export default async function AlbumDetailPage({ params }) {
  const albumId = params.id;

  const album = await fetchAlbumById(albumId).catch(() => null);
  if (!album) {
    return <div className="text-red-500 p-10">Album not found (ID: {albumId})</div>;
  }

  const artist = album.artist_id
    ? await fetchArtistById(album.artist_id).catch(() => null)
    : null;

  const allAlbums = await fetchAlbums();
  const otherAlbums = allAlbums
    .filter(
      (a) =>
        a.id !== album.id &&
        a.artist_id?.toString() !== album.artist_id?.toString()
    )
    .slice(0, 5);

  return <AlbumClient album={album} artist={artist} otherAlbums={otherAlbums} />;
}
