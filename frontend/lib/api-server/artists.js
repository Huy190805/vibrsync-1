// lib/api-server/artists.js
export async function fetchArtistById(id) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/artists/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch artist");
  return await res.json();
}

export async function fetchSuggestedArtists(artistId) {
  const res = await fetch(`${process.env.API_BASE_URL}/api/artists`, {
    cache: "no-store",
  });
  const data = await res.json();
  return (data.artists || [])
    .filter((a) => a.id !== artistId && a._id !== artistId)
    .slice(0, 5);
}
