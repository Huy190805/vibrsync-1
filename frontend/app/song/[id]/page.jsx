import SongPageClient from './SongPageClient';
import TopSongs from '@/components/artist/TopSongs';
import {
  fetchSongById,
  fetchSongs,
  fetchArtistById,
  fetchTopSongs,
} from '@/lib/api';

export default async function SongPage({ params }) {
  const { id } = params;

  const song = await fetchSongById(id);
  if (!song) return <div className="text-center mt-24">Song not found.</div>;

  const artist = song.artistId
    ? await fetchArtistById(song.artistId)
    : { name: song.artist };

  const allSongs = await fetchSongs();
  const relatedSongs = allSongs.filter(
    (s) => s.id !== song.id && s.artistId === song.artistId
  );

  const topSongs = await fetchTopSongs(); // ✅ fetch top songs

  return (
    <SongPageClient
      song={song}
      artist={artist}
      relatedSongs={relatedSongs}
      topSongs={topSongs}
    />
  );
}
