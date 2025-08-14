"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { PlayCircle, Users, Star, ArrowLeft } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ArtistStatistics() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "artist") {
      router.push("/signin");
      return;
    }
    async function loadStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/artist/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load statistics", err);
      }
    }
    if (!authLoading) loadStats();
  }, [user, authLoading, router]);

  if (authLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-white">
        Loading statistics...
      </div>
    );
  }

const chartData = {
  labels: (stats.recentDays || []).map((d) => d.date),
  datasets: [
    {
      label: "Daily Streams",
      data: (stats.recentDays || []).map((d) => d.streams),
      backgroundColor: "#7c3aed",
      borderRadius: 6,
    },
  ],
};


  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#ccc" },
      },
      x: {
        ticks: { color: "#ccc" },
      },
    },
  };

  return (
    <div className="relative text-white p-6 md:p-10 min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950">
      {/* Back Button */}
      <button
        onClick={() => router.push("/role_artist/dashboard")}
        className="mb-4 flex items-center text-sm hover:underline text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Dashboard
      </button>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Artist Statistics</h1>
        <p className="text-gray-400">Your music performance at a glance.</p>
      </div>

      {/* Stat Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-purple-800 to-purple-600 rounded-xl p-6 shadow-lg flex items-center gap-4">
          <PlayCircle size={32} className="text-white" />
          <div>
            <p className="text-sm text-gray-300">Total Streams</p>
            <h2 className="text-2xl font-bold">{stats.totalStreams}</h2>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-800 to-indigo-600 rounded-xl p-6 shadow-lg flex items-center gap-4">
          <Users size={32} className="text-white" />
          <div>
            <p className="text-sm text-gray-300">Unique Listeners</p>
            <h2 className="text-2xl font-bold">{stats.uniqueListeners}</h2>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-700 to-emerald-500 rounded-xl p-6 shadow-lg flex items-center gap-4">
          <Star size={32} className="text-white" />
          <div>
            <p className="text-sm text-gray-300">Top Song</p>
            <h2 className="text-xl font-semibold">{stats.topSong || "N/A"}</h2>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900/60 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Streams Over Time</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
