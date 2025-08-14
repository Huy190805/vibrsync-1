"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
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

export default function FollowPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalFollowers: null, uniqueFollowers: null });
  const [followedUsers, setFollowedUsers] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only admins can access this page",
      });
      return;
    }

    const fetchFollowerStats = async () => {
      try {
        const cached = sessionStorage.getItem("follow-stats");
        if (cached) {
          const parsed = JSON.parse(cached);
          setStats(parsed.stats);
          setFollowedUsers(parsed.followedUsers);
          setFollowedArtists(parsed.followedArtists);
          setLoading(false);
          return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const [totalRes, uniqueRes, usersRes, artistsRes] = await Promise.all([
          fetch("http://localhost:8000/api/admin/follow/total-followers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/admin/follow/unique-followers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/admin/follow/followed-users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/admin/follow/followed-artists", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!totalRes.ok || !uniqueRes.ok || !usersRes.ok || !artistsRes.ok)
          throw new Error("Failed to fetch stats");

        const [totalData, uniqueData, usersData, artistsData] = await Promise.all([
          totalRes.json(),
          uniqueRes.json(),
          usersRes.json(),
          artistsRes.json(),
        ]);

        const dataToCache = {
          stats: {
            totalFollowers: totalData.totalFollowers,
            uniqueFollowers: uniqueData.uniqueFollowers,
          },
          followedUsers: usersData.users,
          followedArtists: artistsData.artists,
        };

        setStats(dataToCache.stats);
        setFollowedUsers(dataToCache.followedUsers);
        setFollowedArtists(dataToCache.followedArtists);
        sessionStorage.setItem("follow-stats", JSON.stringify(dataToCache));
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load follower data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFollowerStats();
  }, [user, toast]);

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

  if (!user || user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const chartData = followedArtists
    .sort((a, b) => b.follower_count - a.follower_count)
    .slice(0, 20);

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text"
      >
        Follow Statistics
      </motion.h1>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="bg-gray-800 border border-green-500/30 rounded-lg shadow">
          <CardHeader>
            <div className="flex items-center">
              <Users className="text-green-400 mr-3 h-6 w-6" />
              <CardTitle className="text-lg text-white">Total Follows</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalFollowers || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Total follow actions across users and artists.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-green-500/30 rounded-lg shadow">
          <CardHeader>
            <div className="flex items-center">
              <Users className="text-green-400 mr-3 h-6 w-6" />
              <CardTitle className="text-lg text-white">Unique Followers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.uniqueFollowers || 0}</p>
            <p className="text-sm text-gray-400 mt-2">Unique users who followed artists.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Panels */}
      <div className="grid grid-cols-[7fr_5fr] gap-6 mt-10">
        {/* Artists */}
        <div className="bg-gray-900 p-6 rounded-lg shadow border border-green-500/20">
          <h2 className="text-2xl font-bold text-green-400 mb-6">🎤 Artists who got followed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto scroll-container pr-2">
            {followedArtists.map((artist, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4 shadow hover:scale-[1.02] transition-transform duration-200"
              >
                <img
                  src={artist.image || "/placeholder.svg"}
                  alt={artist.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-white truncate">{artist.name}</h3>
                    <span className="inline-flex items-center bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow shrink-0 ml-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                          2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                          4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                          19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                          6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {artist.follower_count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{artist.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="bg-gray-900 p-6 rounded-lg shadow border border-green-500/20">
          <h2 className="text-2xl font-bold text-green-400 mb-6">Users who followed</h2>
          <ul className="space-y-2 text-gray-200 text-sm scroll-container max-h-[600px] overflow-y-auto pr-2">
            {followedUsers.map((u, i) => (
              <li key={i}>
                <span className="font-medium">{u.name}</span> ({u.email})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900 mt-10 p-6 rounded-lg shadow border border-green-500/20">
        <h2 className="text-2xl font-bold text-green-400 mb-6">📊 Top 20 Most Followed Artists</h2>
        <div className="max-h-[600px] overflow-y-auto scroll-container pr-2">
          <ResponsiveContainer width="100%" height={chartData.length * 60}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 80, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" stroke="#ccc" />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#ccc"
                width={180}
                tick={({ x, y, payload }) => {
                  const artist = chartData.find((a) => a.name === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <image
                        x={-200}
                        y={-20}
                        width={50}
                        height={50}
                        href={artist?.image || "/placeholder.svg"}
                        className="rounded-full"
                      />
                      <text x={-140} y={0} dy={4} fill="#ccc" fontSize={14}>
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const artist = payload[0].payload;
                    return (
                      <div className="bg-white p-2 rounded shadow max-w-[250px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={artist.image || "/placeholder.svg"}
                            alt={artist.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{artist.name}</p>
                            <p className="text-sm text-gray-700">{artist.follower_count} followers</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="follower_count" fill="#10b981">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
    </div>
  );
}
