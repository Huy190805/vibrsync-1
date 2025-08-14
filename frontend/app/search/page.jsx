"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchAll } from "@/lib/api/search";
import { recordSearch } from "@/lib/api/listen";
import { useAuth } from "@/context/auth-context";
import { useMusic } from "@/context/music-context";
import axios from "@/lib/axiosInstance"; 

import { Play } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("query") || "").trim();
  const router = useRouter();
  const { user } = useAuth();

  // MUSIC CONTEXT
  const {audioRef,
    currentSong,
    isPlaying,
    setSongs,
    playSong,
    setContext,
    setContextId,
  } = useMusic();

  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Cache wrapper like before
  const fetchSearchResults = async (q) => {
    const cacheKey = q ? `search_${q}` : "search_trending";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setResults(JSON.parse(cached));
      return;
    }

    setLoading(true);
    try {
      let data;
      if (q) {
        data = await searchAll(q);
      } else {
        const res = await fetch("http://localhost:8000/api/search");
        data = await res.json();
      }
      setResults(data || { songs: [], artists: [], albums: [] });
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to fetch search results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Helpers
  const normalizeSong = (s) => {
    const id = s.id || s._id || (s._id && (typeof s._id === "object" ? s._id.toString() : s._id));
    return {
      ...s,
      id,
      title: s.title || s.name || "",
      artist: s.artist || s.artistName || s.artist?.name,
      duration: s.duration || s.length || 0,
      coverArt: s.coverArt || s.cover_art || s.cover || s.cover_url || s.cover_image,
      // keep other fields (like url/file) if present
    };
  };

  const isSongPlaying = (song) => {
    if (!currentSong || !song) return false;
    const curId = currentSong.id || currentSong._id;
    const songId = song.id || song._id;
    return isPlaying && curId?.toString() === songId?.toString();
  };

const handlePlaySong = async (song, e) => {
  if (e) e.stopPropagation();
  const normalized = normalizeSong(song);

  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  await new Promise((r) => setTimeout(r, 100)); // delay 100ms để tránh race condition

  setSongs([normalized]);
  setContext("search");
  setContextId(normalized.id);
  playSong(normalized);
};


// Play all songs of an artist
const handlePlayArtist = async (artist, e) => {
  if (e) e.preventDefault(), e.stopPropagation();
  const artistId = artist.id || artist._id || artist._id?.toString();
  if (!artistId) return;

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await axios.get(`/api/artists/${artistId}/songs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const songs = (res.data?.songs || []).map((s) => {
      const n = normalizeSong(s);
      if (!n.audio_url && n.file_url) {
        n.audio_url = `http://localhost:8000${n.file_url}`;
      }
      return { ...n, artist_id: artistId };
    });

    if (songs.length === 0) return;

    setSongs(songs);
    setContext("artist");
    setContextId(artistId);
    playSong(songs[0]);
  } catch (err) {
    console.error("Failed to load artist songs:", err);
  }
};

// Play all songs of an album
const handlePlayAlbum = async (album, e) => {
  if (e) e.preventDefault(), e.stopPropagation();
  const albumId = album.id || album._id || album._id?.toString();
  if (!albumId) return;

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await axios.get(`/api/albums/${albumId}/songs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const songs = (res.data?.songs || []).map((s) => {
      const n = normalizeSong(s);
      if (!n.audio_url && n.file_url) {
        n.audio_url = `http://localhost:8000${n.file_url}`;
      }
      return { ...n, album_id: albumId };
    });

    if (songs.length === 0) return;

    setSongs(songs);
    setContext("album");
    setContextId(albumId);
    playSong(songs[0]);
  } catch (err) {
    console.error("Failed to load album songs:", err);
  }
};


  // Click row -> navigate to song page (and record search)
  const handleRowClick = async (song) => {
    if (user?.id) {
      try {
        await recordSearch(user.id, song._id || song.id, new Date().toISOString());
      } catch (err) {
        console.error("Failed to record search:", err);
      }
    }
    const id = song._id || song.id;
    router.push(`/song/${id}`);
  };

  const topArtist = results.artists?.[0] || null;

  return (
    <section className="p-6 space-y-12">
      {/* TOP AUTHOR + SONGS */}
      <div className="flex flex-col lg:flex-row gap-10">
        {topArtist && (
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Top Result</h2>
            <Link
              href={`/artist/${topArtist._id || topArtist.id}`}
              className="relative flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
              onMouseEnter={() => setHoveredItem(`artist-${topArtist.id || topArtist._id}`)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative w-[96px] h-[96px] flex-shrink-0">
                <Image
                  src={topArtist.image || topArtist.avatar_url || "/placeholder.svg"}
                  alt={topArtist.name}
                  fill
                  className="rounded-full object-cover"
                />
                {/* overlay play */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity ${
                    hoveredItem === `artist-${topArtist.id || topArtist._id}` ? "opacity-100" : "opacity-0"
                  } bg-black/40`}
                >
                  <button
                    onClick={(e) => handlePlayArtist(topArtist, e)}
                    className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-3"
                    aria-label="Play artist"
                  >
                    <Play size={18} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold">{topArtist.name}</h3>
                <p className="text-sm text-gray-400">Artist</p>
              </div>
            </Link>
          </div>
        )}

        {/* Songs */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Songs</h2>
          <div className="space-y-3">
            {results.songs.slice(0, 8).map((songRaw) => {
              const song = normalizeSong(songRaw);
              const hoverKey = `song-${song.id}`;
              const playing = isSongPlaying(song);

              return (
                <div
                  key={song.id}
                  className="group relative flex items-center justify-between p-3 rounded hover:bg-white/5 cursor-pointer"
                  onMouseEnter={() => setHoveredItem(hoverKey)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleRowClick(song)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <Image
                        src={song.coverArt || "/placeholder.svg"}
                        alt={song.title}
                        fill
                        className="rounded object-cover"
                      />

                      <div
                        className={`absolute inset-0 flex items-center justify-center rounded transition-opacity ${
                          hoveredItem === hoverKey ? "opacity-100" : "opacity-0"
                        } bg-black/40`}
                      >
                        <button
                          onClick={(e) => handlePlaySong(song, e)}
                          className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-2"
                          aria-label="Play song"
                        >
                          <Play size={14} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium">{song.title}</p>
                      <p className="text-xs text-gray-400">{song.artist || "Unknown Artist"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{formatDuration(song.duration)}</span>

                    {/* playing indicator */}
                    {playing && (
                      <div className="w-6 h-6 flex items-center justify-center">
                        {/* simple animated bars */}
                        <div className="flex items-end gap-1">
                          <span className="w-1 h-3 bg-white animate-pulse" />
                          <span className="w-1 h-4 bg-white animate-[pulse_1s_infinite]" />
                          <span className="w-1 h-2 bg-white animate-[pulse_0.8s_infinite]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Albums */}
      <ResultBlock title="Albums" loading={loading} items={results.albums}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {results.albums.map((albumRaw) => {
            const album = {
              ...albumRaw,
              id: albumRaw.id || albumRaw._id || (albumRaw._id && albumRaw._id.toString()),
            };
            const hoverKey = `album-${album.id}`;

            return (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="relative flex flex-col gap-2 hover:bg-white/5 p-3 rounded"
                onMouseEnter={() => setHoveredItem(hoverKey)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded">
                  <Image
                    src={
                      album.cover_art ||
                      album.cover_url ||
                      album.coverArt ||
                      album.coverImage ||
                      "/placeholder.svg"
                    }
                    alt={album.title}
                    fill
                    className="object-cover w-full h-full"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded transition-opacity ${
                      hoveredItem === hoverKey ? "opacity-100" : "opacity-0"
                    } bg-black/40`}
                  >
                    <button
                      onClick={(e) => handlePlayAlbum(album, e)}
                      className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-3"
                      aria-label="Play album"
                    >
                      <Play size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-medium leading-tight truncate">{album.title}</p>
                {album.release_year && <p className="text-xs text-gray-500">{album.release_year}</p>}
              </Link>
            );
          })}
        </div>
      </ResultBlock>
    </section>
  );
}

/* ResultBlock & helpers */
function ResultBlock({ title, loading, items, children }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items?.length ? (
        children
      ) : (
        <p className="text-gray-500 italic">No {title.toLowerCase()} found.</p>
      )}
    </div>
  );
}

function formatDuration(sec = 0) {
  if (!sec) return "00:00";
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
