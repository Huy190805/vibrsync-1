// File: components/home/ArtistFanSection/ArtistFanSection.jsx
import { fetchSongsByArtistWithQuery } from "@/lib/api/songs";
import ArtistFanSectionClient from "./ArtistFanSectionClient";

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default async function ArtistFanSection({ artists }) {
  try {
    const artistsArray = Array.isArray(artists) ? artists : artists?.artists || [];
    if (!artistsArray.length) {
      throw new Error("No artists found or invalid data format");
    }

    const mappedArtists = artistsArray.map((artist) => ({
      id: artist._id || artist.id || crypto.randomUUID(),
      name: artist.name || "Unknown Artist",
      avatar: artist.thumbnail || artist.image || "https://via.placeholder.com/80",
      followers: artist.followers ? `${(artist.followers / 1_000_000).toFixed(1)}M` : "0M",
    }));

    const currentArtistIndex = Math.floor(Math.random() * mappedArtists.length);
    const currentArtist = mappedArtists[currentArtistIndex];

    const songsData = await fetchSongsByArtistWithQuery(currentArtist.id, {
      cache: "force-cache",
      fields: "_id,title,artist,coverArt,duration,artistId",
      limit: 20,
    });

    const mappedSongs = (songsData || [])
      .filter((song) => {
        const hasValidId = song._id || song.id;
        const matchesArtistById = String(song.artistId) === String(currentArtist.id);
        const matchesArtistByName = song.artist === currentArtist.name;
        return hasValidId && (matchesArtistById || matchesArtistByName);
      })
      .map((song) => ({
        id: song._id || song.id || crypto.randomUUID(),
        title: song.title || "Unknown Song",
        duration: song.duration ? formatDuration(song.duration) : "3:00",
        image: song.thumbnail || song.coverArt || song.image || "https://via.placeholder.com/180",
        audioUrl: song.audioUrl || "",
        coverArt: song.coverArt || "",
        artist_id: song.artistId || currentArtist.id,
        artist: song.artist || currentArtist.name,
      }));

    return (
      <ArtistFanSectionClient
        initialArtists={mappedArtists}
        initialArtistIndex={currentArtistIndex}
        initialSongs={mappedSongs}
      />
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("ArtistFanSection Error:", error);
    }
    return (
      <div className="text-center text-red-400 text-lg font-medium">
        Failed to load artist section: {error.message}
      </div>
    );
  }
}
