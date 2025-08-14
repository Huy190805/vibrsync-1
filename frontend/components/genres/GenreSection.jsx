"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchGenreData } from "./dataGenres.jsx";

// Component hiển thị section cho từng thể loại (Pop & Ballad, Vietnamese, v.v.)
export default function GenreSection({ genreTitle, hideTitle = false }) {
  const [data, setData] = useState({ title: genreTitle, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchGenreData(genreTitle);
        setData(result);
      } catch (err) {
        setError(`Không tải được danh sách ${genreTitle}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [genreTitle]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-400 mt-2">Loading {genreTitle}...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 py-10">{error}</div>;
  }

  return (
    <section className="space-y-10">
      {/* Chỉ hiển thị tiêu đề nếu không bị ẩn */}
      {!hideTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold">{data.title}</h2>
          <p className="text-gray-400">Playlists selected by filterable type</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {data.items.map((item, j) => (
          <Link
            key={j}
            href={{
              pathname: "/playlistByGenre",
              query: {
                title: item.title,
                image: item.image,
                genre: item.genre,
                subtitle: item.subtitle,
                time: item.time,
                followers: item.followers,
              },
            }}
            className="bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:scale-[1.03]"
          >
            <Image
              src={item.image}
              alt={`Hình ảnh bìa cho ${item.title}`}
              width={300}
              height={300}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-sm truncate">{item.title}</h3>
              <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
