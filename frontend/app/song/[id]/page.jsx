// ✅ Server Component: app/song/[id]/page.jsx
import { fetchSongById, fetchSongs, fetchArtistById } from '@/lib/api';
import SongPageClient from './SongPageClient';

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

  return <SongPageClient song={song} artist={artist} relatedSongs={relatedSongs} />;
}

 