"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { genreTitles } from "@/components/genres/dataGenres";
import { fetchSongsByGenre } from "@/lib/api/songs";

export default function AdminGenresPage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dữ liệu từ API
  useEffect(() => {
    const loadAllGenres = async () => {
      const genreData = await Promise.all(
        genreTitles.map(async (title) => {
          const { songs } = await fetchSongsByGenre(title);
          return {
            title,
            image: songs[0]?.image || "/default.jpg", // fallback ảnh
            subtitle: songs[0]?.subtitle || "No description",
            songCount: songs.length,
          };
        })
      );
      setGenres(genreData);
      setLoading(false);
    };

    loadAllGenres();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 text-white bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1f] space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎼 Genre Management</h1>
        <Link
          href="/admin/genres/new"
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:brightness-110 transition"
        >
          <PlusCircle size={18} /> Add Genre
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-white mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-3">Loading genres...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {genres.map((genre, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition shadow-lg group"
            >
              <Image
                src={genre.image}
                alt={genre.title}
                width={400}
                height={200}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 space-y-1">
                <h2 className="text-xl font-semibold">{genre.title}</h2>
                <p className="text-gray-400 text-sm">{genre.subtitle}</p>
                <p className="text-xs text-gray-500">{genre.songCount} songs</p>
                <div className="flex justify-end gap-3 mt-3 text-sm">
                  <Link
                    href={`/admin/genres/edit/${genre.title}`}
                    className="text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <button
                    onClick={() => console.log("🗑 Delete", genre.title)}
                    className="text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
