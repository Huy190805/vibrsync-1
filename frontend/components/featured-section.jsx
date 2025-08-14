import { fetchTopSongs } from "@/lib/api/songs";
import FeaturedClient from "./FeaturedClient";

export default async function FeaturedSection() {
  const topSongs = await fetchTopSongs(20);
  return <FeaturedClient songs={topSongs} />;
}
