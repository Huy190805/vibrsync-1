// frontend/components/viewAll/AllSongsSection.jsx
"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fetchSongs } from "@/lib/api";
import { useMusic } from "@/context/music-context";
import { formatDuration } from "@/lib/utils";

export default function AllSongsSection() {
  const [songsByArtist, setSongsByArtist] = useState({});
  const [activeArtistId, setActiveArtistId] = useState(null);
  const {
    setSongs,
    setContext,
    setContextId,
    playSong,
    isPlaying,
    currentSong,
  } = useMusic();

  useEffect(() => {
    async function loadSongs() {
      const data = await fetchSongs();
      const songs = Array.isArray(data) ? data : data?.songs || [];

      const grouped = {};
      songs.forEach((song) => {
        if (!grouped[song.artistId]) {
          grouped[song.artistId] = {
            artistName: song.artist,
            songs: [],
          };
        }
        grouped[song.artistId].songs.push(song);
      });

      setSongsByArtist(grouped);
    }

    loadSongs();
  }, []);

  const handlePlayAll = (artistId) => {
    const artistSongs = songsByArtist[artistId]?.songs;
    if (!artistSongs || artistSongs.length === 0) return;

    setSongs(artistSongs);
    setContext("artist");
    setContextId(artistId);
    playSong(artistSongs[0]);
    setActiveArtistId(artistId);
  };

  const handlePlaySong = (song, artistSongs) => {
    setSongs(artistSongs);
    setContext("artist");
    setContextId(song.artistId);
    playSong(song);
    setActiveArtistId(song.artistId);
  };

  return (
    <div className="space-y-10">
      {/* Danh sách nghệ sĩ (ẩn thanh scroll ngang) */}
      <div className="flex gap-6 overflow-x-auto pb-4 border-b border-zinc-700 mb-6 scrollbar-hide">
        {Object.entries(songsByArtist).map(([artistId, artistData]) => (
          <Link
            key={artistId}
            href={`/artist/${artistId}`}
            className="text-2xl font-extrabold text-white hover:text-[#39FF14] transition-colors whitespace-nowrap"
          >
            {artistData.artistName}
          </Link>
        ))}
      </div>

      {/* Danh sách bài hát theo nghệ sĩ */}
      {Object.entries(songsByArtist).map(([artistId, artistData]) => {
        const isPlayingThisArtist =
          activeArtistId === artistId &&
          isPlaying &&
          artistData.songs.some((s) => s.id === currentSong?.id);

        return (
          <div
            key={artistId}
            className="bg-[#111111] p-6 rounded-xl border border-zinc-800 hover:border-[#39FF14]/30 shadow-md hover:shadow-[#39FF14]/20 transition-all space-y-4 mt-10"
          >
            {/* Header nghệ sĩ */}
            <div className="flex items-center justify-between">
              <Link
                href={`/artist/${artistId}`}
                className="text-2xl font-extrabold text-white hover:text-[#39FF14] transition-colors"
              >
                {artistData.artistName}
              </Link>

              <button
                onClick={() => handlePlayAll(artistId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium ${
                  isPlayingThisArtist
                    ? "bg-[#39FF14] text-black"
                    : "bg-zinc-800 text-white hover:bg-[#39FF14]/30"
                }`}
              >
                {isPlayingThisArtist ? (
                  <>
                    <Pause size={18} />
                    Playing
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Play All
                  </>
                )}
              </button>
            </div>

            {/* Danh sách bài hát */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-left">
                    <th className="py-2">#</th>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th>Duration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {artistData.songs.map((song, index) => (
                    <tr
                      key={song.id}
                      className="hover:bg-[#39FF14]/5 border-b border-white/5"
                    >
                      <td className="py-3">{index + 1}</td>

                      <td className="py-3">
                        <div className="relative group w-10 h-10">
                          <Link href={`/song/${song.id}`}>
                            <Image
                              src={song.coverArt || "/placeholder.svg"}
                              alt={song.title}
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          </Link>
                          <button
                            onClick={() =>
                              handlePlaySong(song, artistData.songs)
                            }
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-md"
                          >
                            <Play size={16} className="text-white" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3">
                        <Link
                          href={`/song/${song.id}`}
                          className="text-white font-medium hover:underline"
                        >
                          {song.title}
                        </Link>
                      </td>

                      <td className="py-3">
                        <Link
                          href={`/artist/${song.artistId || ""}`}
                          className="text-gray-400 hover:text-[#39FF14] transition-colors"
                        >
                          {song.artist}
                        </Link>
                      </td>

                      <td className="text-gray-300 py-3">
                        {song.album || "Single"}
                      </td>
                      <td className="text-gray-300 py-3">
                        {formatDuration(song.duration || 0)}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-3 justify-end pr-2">
                          <Heart
                            size={16}
                            className="text-zinc-400 hover:text-[#39FF14]"
                          />
                          <MoreHorizontal
                            size={16}
                            className="text-zinc-400 hover:text-[#39FF14]"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
