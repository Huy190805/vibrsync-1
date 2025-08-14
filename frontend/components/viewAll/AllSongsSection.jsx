"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { fetchSongs } from "@/lib/api";
import { useMusic } from "@/context/music-context";

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
            artistImage: song.artistImage || "/placeholder.svg",
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

  return (
    <div className="space-y-8">
      {Object.entries(songsByArtist).map(([artistId, artistData]) => {
        const isPlayingThisArtist =
          activeArtistId === artistId &&
          isPlaying &&
          artistData.songs.some((s) => s.id === currentSong?.id);

        return (
          <div
            key={artistId}
            className="bg-[#111111] p-6 rounded-xl border border-zinc-800 hover:border-[#39FF14]/30 shadow-md hover:shadow-[#39FF14]/20 transition-all space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={artistData.artistImage}
                  alt={artistData.artistName}
                  width={60}
                  height={60}
                  className="rounded-full object-cover border border-white/20"
                />
                <h3 className="text-white text-lg font-bold">
                  {artistData.artistName}
                </h3>
              </div>

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
            <div className="w-full">
              <table className="w-full text-sm text-white">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-left">
                    <th className="py-2">#</th>
                    <th>Title</th>
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
                      <td className="py-2">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Image
                            src={song.cover_art || "/placeholder.svg"}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <p className="text-white font-medium">
                              {song.title}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {song.artist}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-300">{song.album || "Single"}</td>
                      <td className="text-gray-300">{song.duration || "?"}</td>
                      <td>
                        <div className="flex gap-3 justify-end pr-2">
                          <Heart size={16} className="text-zinc-400 hover:text-[#39FF14]" />
                          <MoreHorizontal size={16} className="text-zinc-400 hover:text-[#39FF14]" />
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
