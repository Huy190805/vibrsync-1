export async function fetchAlbumsByArtist(artistId) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/albums/artist/${artistId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("❌ Failed to fetch albums", await res.text());
    return { albums: [] };
  }

  const data = await res.json();
  return {
    albums: Array.isArray(data?.albums) ? data.albums : [],
  };
}
