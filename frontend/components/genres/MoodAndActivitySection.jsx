"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchMoodAndActivityData } from "./dataGenres.jsx";

export default function MoodAndActivitySection({ hideTitle = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CACHE_KEY = "mood_activity_data";

  // ✅ Tách ra hàm load dữ liệu + dùng cache sessionStorage
  const loadMoodAndActivity = async () => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoading(false);
        return;
      } catch (err) {
        console.warn("⚠️ Lỗi khi đọc cache Mood & Activity:", err);
      }
    }

    try {
      const result = await fetchMoodAndActivityData();
      setData(result);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch (err) {
      setError("Không tải được danh sách Mood & Activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoodAndActivity();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading Mood & Activity ...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 py-10">{error}</div>;
  }

  return (
    <div className="space-y-10">
      {!hideTitle && (
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-3">🌀 Mood & Activity</h1>
          <p className="text-gray-400">Choose a playlist that suits your mood</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((topic, index) => (
          <div
            key={index}
            className="relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 bg-white/5 hover:bg-white/10"
          >
            <Image
              src={topic.image}
              alt={`Hình ảnh bìa cho ${topic.title}`}
              width={600}
              height={300}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
              <h2 className="text-xl font-bold mb-2">{topic.title}</h2>
              <p className="text-sm text-gray-400 mb-2">{topic.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                {topic.playlists.map((pl, i) => (
                  <Link
                    key={i}
                    href={{
                      pathname: pl.href,
                      query: {
                        title: pl.title,
                        image: topic.image,
                        genre: pl.genre,
                        subtitle: topic.subtitle,
                        time: topic.time,
                        followers: topic.followers,
                      },
                    }}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition"
                  >
                    {pl.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
