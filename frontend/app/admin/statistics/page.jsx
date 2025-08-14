"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import clsx from "clsx";

export default function ListenPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalListens, setTotalListens] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topCombinedChart, setTopCombinedChart] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchListenStats = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        const today = new Date().toISOString().split("T")[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const getCachedOrFetch = async (key, url, auth = true) => {
          const cache = sessionStorage.getItem(key);
          if (cache) return JSON.parse(cache);
          const res = await fetch(url, {
            headers: auth ? { Authorization: `Bearer ${token}` } : {},
          });
          const json = await res.json();
          sessionStorage.setItem(key, JSON.stringify(json));
          return json;
        };

        const [
          totalData,
          activityJson,
          topJson,
          topListenJson,
          topRepeatJson,
          topSearchJson,
        ] = await Promise.all([
          getCachedOrFetch("cache_total_listens", "http://localhost:8000/api/admin/statistics/total-listens"),
          getCachedOrFetch("cache_listen_activity", `http://localhost:8000/api/admin/statistics/listen-activity?start_date=${thirtyDaysAgo}&end_date=${today}`),
          getCachedOrFetch("cache_top_songs", "http://localhost:8000/api/admin/statistics/top-listened-songs?limit=20"),
          getCachedOrFetch("cache_top_listens", "http://localhost:8000/api/listens/top?limit=50", false),
          getCachedOrFetch("cache_top_repeats", "http://localhost:8000/api/listens/top-repeated?limit=50", false),
          getCachedOrFetch("cache_top_searches", "http://localhost:8000/api/listens/top-searched?limit=50", false),
        ]);

        setTotalListens(totalData.total_listens || 0);
        setActivityData(activityJson || []);
        setTopSongs(topJson || []);

        // 🧠 Combined Chart
        const map = {};
        const songInfo = {};

        topJson.forEach((song) => {
          songInfo[song._id] = {
            title: song.title,
            artist: song.artist_name || song.artist,
          };
        });
        activityJson.forEach((day) => {
          day.songs.forEach((song) => {
            if (!songInfo[song._id]) {
              songInfo[song._id] = {
                title: song.title,
                artist: song.artist || song.artist_name,
              };
            }
          });
        });

        topListenJson.forEach((item) => {
          map[item._id] = {
            songId: item._id,
            title: songInfo[item._id]?.title || "Unknown Title",
            artist: songInfo[item._id]?.artist || "Unknown Artist",
            listen: item.count || 0,
            repeat: 0,
            search: 0,
          };
        });

        topRepeatJson.forEach((item) => {
          if (!map[item._id]) {
            map[item._id] = {
              songId: item._id,
              title: songInfo[item._id]?.title || "Unknown Title",
              artist: songInfo[item._id]?.artist || "Unknown Artist",
              listen: 0,
              repeat: 0,
              search: 0,
            };
          }
          map[item._id].repeat = item.repeat_total || 0;
        });

        topSearchJson.forEach((item) => {
          if (!map[item._id]) {
            map[item._id] = {
              songId: item._id,
              title: songInfo[item._id]?.title || "Unknown Title",
              artist: songInfo[item._id]?.artist || "Unknown Artist",
              listen: 0,
              repeat: 0,
              search: 0,
            };
          }
          map[item._id].search = item.search_count || 0;
        });

        const topCombinedArray = Object.values(map)
          .filter((song) => song.listen > 0)
          .sort((a, b) => (b.listen + b.repeat + b.search) - (a.listen + a.repeat + a.search));

        setTopCombinedChart(topCombinedArray);

        // 🔁 Chart từ activity
        const aggregated = {};
        activityJson.forEach((day) => {
          day.songs.forEach((song) => {
            const key = song.title;
            if (!aggregated[key]) {
              aggregated[key] = {
                title: song.title,
                artist: song.artist || song.artist_name || "",
                image: song.cover || "/placeholder.svg",
                count: 0,
              };
            }
            aggregated[key].count += song.count || 1;
          });
        });

        const transformed = Object.values(aggregated)
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);

        setChartData(transformed);
      } catch (err) {
        console.error("❌ Failed to fetch listen data", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load listen statistics",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchListenStats();
    } else if (user) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only admins can access this page",
      });
      router.push("/"); // 👈 hoặc "/home" tùy trang chính của bạn
    }
  }, [user, toast, router]);

    // ✅ Chỉ giữ lại 20 bài có tổng listen+repeat+search cao nhất
  const top20Data = topCombinedChart
    .map(item => ({
      ...item,
      total: (item.listen || 0) + (item.repeat || 0) + (item.search || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);

  // Custom Tooltip for Combined Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg border border-green-500/50 shadow-lg">
          <p className="text-white font-semibold">{data.title}</p>
          <p className="text-gray-300 text-sm">Artist: {data.artist}</p>
          <p className="text-green-400 text-sm">Listens: {data.listen}</p>
          <p className="text-yellow-400 text-sm">Repeats: {data.repeat}</p>
          <p className="text-blue-400 text-sm">Searches: {data.search}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-300">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-t-green-500 border-gray-700 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text"
      >
        Listen Statistics
      </motion.h1>

      <div className="bg-gray-900 mb-10 p-6 rounded-lg shadow border border-green-500/20">
        <p className="text-white text-lg font-medium">Total Listens</p>
        <p className="text-3xl text-green-400 font-bold">{totalListens}</p>
        <p className="text-gray-400 text-sm mt-1">All recorded listens (≥120s)</p>
      </div>

      {/* 📈 Combined Top Songs Chart */}
      <div className="bg-gray-900 mb-10 p-6 rounded-lg shadow border border-green-500/20">
        <p className="text-white text-xl font-semibold mb-4">🔥 Top Most Listened Songs Chart (Combined)</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={top20Data}
            margin={{ top: 20, right: 30, left: 0, bottom: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis
              dataKey="title"
              angle={-45}
              textAnchor="end"
              interval={0}
              stroke="#ccc"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#ccc" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="listen" fill="#10b981" name="Listens" />
            <Bar dataKey="repeat" fill="#facc15" name="Repeats" />
            <Bar dataKey="search" fill="#60a5fa" name="Searches" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 Top Song Activity Chart */}
      <div className="bg-gray-900 mb-10 p-6 rounded-lg shadow border border-green-500/20">
        <p className="text-white text-xl font-semibold mb-4">📊 Top Song Activity Chart</p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis
              dataKey="title"
              angle={-45}
              textAnchor="end"
              interval={0}
              stroke="#ccc"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", borderColor: "#10b981" }}
              formatter={(value, name, props) => [value, `${props.payload.artist} - ${name}`]}
            />
            <Bar dataKey="count" fill="#10b981" name="Listens" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🎧 Top 20 Most Listened Songs */}
      <div className="bg-gray-900 p-6 rounded-lg shadow border border-green-500/20">
        <p className="text-white text-xl font-semibold mb-4">🎧 Top 20 Most Listened Songs</p>
        <div className="space-y-4 text-gray-200 text-sm scroll-container max-h-[600px] overflow-y-auto pr-2">
          {topSongs.map((song, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-center space-x-4 rounded-lg p-4 shadow",
                "bg-gray-800 border-l-4",
                i === 0 ? "border-yellow-400" : i === 1 ? "border-gray-400" : i === 2 ? "border-orange-400" : "border-gray-700"
              )}
            >
              <span className="text-2xl font-extrabold text-green-400 w-6">{i + 1}</span>
              <img src={song.cover || "/placeholder.svg"} alt={song.title} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{song.title}</p>
                <p className="text-gray-400 text-sm truncate">{song.artist_name || song.artist}</p>
                <p className="text-gray-500 text-xs truncate">⏱ Duration: {formatDuration(song.duration)}</p>
              </div>
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                {song.listen_count || song.count} listens
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}