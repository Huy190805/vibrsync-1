"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function AdminLikesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState(0);
  const [uniqueLikers, setUniqueLikers] = useState(0);
  const [likingUsers, setLikingUsers] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    const fetchLikeStats = async () => {
      if (!user || user.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "Only admins can access this page",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const getCachedOrFetch = async (key, url) => {
          const cache = sessionStorage.getItem(key);
          if (cache) return JSON.parse(cache);

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await res.json();
          sessionStorage.setItem(key, JSON.stringify(data));
          return data;
        };

        const [totalData, uniqueData, usersData, songsData] = await Promise.all([
          getCachedOrFetch("likes_total", "http://localhost:8000/api/admin/likes/total-likes"),
          getCachedOrFetch("likes_unique", "http://localhost:8000/api/admin/likes/unique-likers"),
          getCachedOrFetch("likes_users", "http://localhost:8000/api/admin/likes/liking-users"),
          getCachedOrFetch("likes_songs", "http://localhost:8000/api/admin/likes/most-liked-songs"),
        ]);

        setTotalLikes(totalData.totalLikes || 0);
        setUniqueLikers(uniqueData.uniqueLikers || 0);
        setLikingUsers(usersData.users || []);
        setLikedSongs(songsData.most_liked || []);
      } catch (error) {
        console.error("Error fetching like stats:", error);
        toast({
          title: "Error",
          description: "Failed to load like statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLikeStats();
  }, [user, toast]);

  const chartData = likedSongs.slice(0, 20);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-t-purple-400 border-gray-600 rounded-full"
        />
      </div>
    );
  }

  // 🎯 Trả về giao diện ban đầu như cũ, dùng dữ liệu đã cache
  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold text-purple-400 mb-8">
        💜 Like Statistics
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-gray-800 border border-purple-500/30 shadow rounded-lg">
          <CardHeader>
            <div className="flex items-center">
              <Heart className="text-purple-400 mr-3 h-6 w-6" />
              <CardTitle className="text-lg text-white">Total Likes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalLikes}</p>
            <p className="text-sm text-gray-400 mt-2">Total like actions recorded.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-purple-500/30 shadow rounded-lg">
          <CardHeader>
            <div className="flex items-center">
              <Heart className="text-purple-400 mr-3 h-6 w-6" />
              <CardTitle className="text-lg text-white">Unique Likers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{uniqueLikers}</p>
            <p className="text-sm text-gray-400 mt-2">Unique users who liked songs.</p>
          </CardContent>
        </Card>
      </div>

      {/* Most Liked Songs + Users */}
      <div className="grid grid-cols-[7fr_5fr] gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-purple-500/20 shadow">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">🔥 Most Liked Songs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto pr-1 whitespace-pre-line scroll-container">
            {likedSongs.map((song, index) => (
              <div
                key={song.song_id}
                className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4 shadow hover:scale-[1.02] transition-transform duration-200"
                title={`${index + 1}. ${song.title}`}
              >
                <img
                  src={song.image || "/placeholder.svg"}
                  alt={song.title}
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-white truncate">
                      #{index + 1} {song.title}
                    </h3>
                    <span className="inline-flex items-center bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ❤️ {song.like_count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-purple-500/20 shadow">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">Users who liked</h2>
          <ul className="space-y-2 text-gray-200 text-sm max-h-[600px] overflow-y-auto pr-2">
            {likingUsers.map((u, i) => (
              <li key={i}>
                <span className="font-medium">{u.name}</span> ({u.email})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-900 mt-10 p-6 rounded-lg shadow border border-purple-500/20">
        <h2 className="text-2xl font-bold text-purple-400 mb-6">📊 Top 20 Most Liked Songs</h2>
        <div className="max-h-[600px] overflow-y-auto">
          <ResponsiveContainer width="100%" height={chartData.length * 60}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 80, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" stroke="#ccc" />
              <YAxis
                dataKey="title"
                type="category"
                stroke="#ccc"
                width={180}
                tick={({ x, y, payload }) => {
                  const song = chartData.find((s) => s.title === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <image
                        x={-200}
                        y={-20}
                        width={50}
                        height={50}
                        href={song?.image || "/placeholder.svg"}
                        className="rounded-full"
                      />
                      <text x={-140} y={0} dy={4} fill="#ccc" fontSize={14}>
                        {payload.value}
                      </text>
                      <text x={-140} y={16} dy={4} fill="#999" fontSize={12}>
                        {song?.artist}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const song = payload[0].payload;
                    return (
                      <div className="bg-white p-2 rounded shadow max-w-[250px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={song.image || "/placeholder.svg"}
                            alt={song.title}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{song.title}</p>
                            <p className="text-sm text-gray-700">{song.artist}</p>
                            <p className="text-sm text-gray-700">
                              {song.like_count} ❤️
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="like_count" fill="#8b5cf6">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#8b5cf6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
