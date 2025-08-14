import Link from "next/link"
import PlaylistGrid from "./playlist-grid"
import { getAllPublicPlaylists } from "@/lib/api/playlists";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default async function RecommendedPlaylists() {
  // Fetch playlists from API
  const playlistsData = (await getAllPublicPlaylists() || []).filter(p => p.isPublic);
  // Filter first 6 playlists
  const recommendedPlaylists = playlistsData.slice(0, 6)


}