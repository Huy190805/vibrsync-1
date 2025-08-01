// pages/album/[id]/page.jsx
import { fetchAlbumById, fetchArtistById, fetchSongsByIds, fetchAlbums } from "@/lib/api/albums";
import AlbumPageClient from "./AlbumPageClient";

// Hàm fetch dữ liệu trên server
async function fetchAlbumData(id, isFromOtherAlbums) {
  try {
    // Gọi song song các API để tối ưu tốc độ
    const [albumData, artistData] = await Promise.all([
      fetchAlbumById(id),
      fetchAlbumById(id).then((album) => fetchArtistById(album?.artist_id)).catch(() => null),
    ]);

    if (!albumData) throw new Error("Album not found");

    // Lấy danh sách bài hát
    const songsData = albumData.songs?.length > 0
      ? await fetchSongsByIds(albumData.songs)
      : [];

    // Lấy album khác nếu không phải từ "Other Albums"
    const artistAlbums = isFromOtherAlbums
      ? []
      : (await fetchAlbums())
          .filter((a) => a.artist_id !== albumData.artist_id)
          .slice(0, 4);

    return {
      album: albumData || null,
      artist: artistData || null,
      songs: songsData || [],
      artistAlbums: artistAlbums || [],
      error: null,
    };
  } catch (err) {
    return {
      album: null,
      artist: null,
      songs: [],
      artistAlbums: [],
      error: err?.message || "Unknown error",
    };
  }
}

export default async function AlbumPage({ params, searchParams }) {
  const id = String(params.id);
  const isFromOtherAlbums = searchParams.from === "other";

  // Fetch dữ liệu trên server
  const initialData = await fetchAlbumData(id, isFromOtherAlbums);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AlbumPageClient initialData={initialData} />
    </div>
  );
}