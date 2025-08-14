// components/home/NewReleases.jsx (Server Component)
import NewReleasesClient from "@/components/home/Client/NewReleasesClient";
import { fetchSongs } from "@/lib/api";

export default async function NewReleases() {
  const result = await fetchSongs({
    sort: "releaseYear",
    limit: 25,
    cache: "force-cache",
  });

  const songs = Array.isArray(result) ? result : result?.songs || [];

  return <NewReleasesClient songs={songs} />;
}
