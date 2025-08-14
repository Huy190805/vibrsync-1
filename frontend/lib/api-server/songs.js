export async function fetchSongsByArtist(artistId) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/artists/${artistId}/songs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("❌ Failed to fetch songs", await res.text());
    return { songs: [] }; // Tránh lỗi khi bị 404 hoặc 500
  }

  const data = await res.json();
  return {
    songs: Array.isArray(data?.songs) ? data.songs : [],
  };
}
