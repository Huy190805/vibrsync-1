"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import clsx from "clsx";
import Link from "next/link";
import { Play } from "lucide-react";
import { useMusic } from "@/context/music-context";
import { formatDuration } from "@/lib/utils";

export default function TopListenStatsClient({ topCombinedChart, topSongs }) {
  const { playSong, setSongs, setContext, setContextId } = useMusic();
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const format = (seconds) => formatDuration(seconds || 0);

  // ✅ Chỉ giữ lại 20 bài có tổng listen+repeat+search cao nhất
  const top20Data = topCombinedChart
    .map(item => ({
      ...item,
      total: (item.listen || 0) + (item.repeat || 0) + (item.search || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg border border-green-500/50 shadow-lg max-w-xs">
          <p className="text-white font-bold mb-1">{data.title}</p>
          <p className="text-gray-300 text-sm">🎤 Artist: {data.artist}</p>
          <p className="text-green-400 text-sm">🎧 Listens: {data.listen}</p>
          <p className="text-yellow-400 text-sm">🔁 Repeats: {data.repeat}</p>
          <p className="text-blue-400 text-sm">🔍 Searches: {data.search}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10">
      <div className="bg-purple-900/30 p-6 rounded-lg shadow border border-purple-500/20">
        <p className="text-white text-xl font-semibold mb-4">
          🔥 Top Most Listened Songs Chart (Combined)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={top20Data} // ✅ Dùng dữ liệu giới hạn 20 bài
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />
            <XAxis
              dataKey="title"
              angle={-45}
              textAnchor="end"
              interval={0}
              stroke="#ccc"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#ccc" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="listen" fill="#10b981" name="Listens" />
            <Bar dataKey="repeat" fill="#facc15" name="Repeats" />
            <Bar dataKey="search" fill="#60a5fa" name="Searches" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 flex justify-center gap-6 text-sm text-gray-300">
          <span className="flex items-center gap-2"><span className="w-4 h-2 bg-green-500"></span> Listens</span>
          <span className="flex items-center gap-2"><span className="w-4 h-2 bg-yellow-400"></span> Repeats</span>
          <span className="flex items-center gap-2"><span className="w-4 h-2 bg-blue-400"></span> Searches</span>
        </div>
      </div>

      {/* Top Songs with Play All */}
      <div className="bg-purple-900/30 p-6 rounded-lg shadow border border-purple-500/20">
        <div className="flex items-center space-x-3 mb-4">
          <p className="text-white text-xl font-semibold flex items-center">
            🎧 Top 20 Most Listened Songs
          </p>
          <button
            onClick={() => {
              if (topSongs.length > 0) {
                const enriched = topSongs.map(s => ({
                  ...s,
                  id: s.song_id || s._id,
                  audioUrl: s.audioUrl,
                  coverArt: s.cover,
                }));
                setSongs(enriched);
                setContext("top-listen");
                setContextId(null);
                playSong(enriched[0]);
                setIsPlayingAll(true);
              }
            }}
            className={`p-2 rounded-full transition-colors duration-300 hover:bg-white/30 ${
              isPlayingAll ? "bg-white text-purple-700" : "bg-white/10 text-white"
            }`}
            title="Play All"
          >
            <Play size={18} />
          </button>
        </div>

        <div className="space-y-4 text-gray-200 text-sm max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
          {topSongs.map((song, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-center space-x-4 rounded-lg p-4 shadow hover:bg-purple-800/20 transition",
                "bg-purple-800/10 border-l-4",
                i === 0
                  ? "border-yellow-400"
                  : i === 1
                  ? "border-gray-400"
                  : i === 2
                  ? "border-orange-400"
                  : "border-purple-700"
              )}
            >
              <span className="text-2xl font-extrabold text-green-400 w-6">{i + 1}</span>
              <img
                src={song.cover || "/placeholder.svg"}
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/song/${song.song_id || song._id}`}
                  className="text-white font-semibold truncate hover:underline"
                >
                  {song.title}
                </Link>
                <p className="text-gray-400 text-sm truncate">
                  {song.artist_name || song.artist}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-xs">⏱ {format(song.duration)}</span>
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow hover:bg-green-700"
                  onClick={() => {
                    const enriched = {
                      ...song,
                      id: song.song_id || song._id,
                      audioUrl: song.audioUrl,
                      coverArt: song.cover,
                    };
                    setSongs(
                      topSongs.map(s => ({
                        ...s,
                        id: s.song_id || s._id,
                        audioUrl: s.audioUrl,
                        coverArt: s.cover,
                      }))
                    );
                    setContext("top-listen");
                    setContextId(null);
                    playSong(enriched);
                  }}
                >
                  <Play size={14} className="inline mr-1" /> Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
