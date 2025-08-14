"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function ListeningHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.id) {
      console.log("🟡 Gửi request lịch sử cho user:", user.id);

      fetch(`http://localhost:8000/api/history/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📥 Response từ API:", data);

          const sorted = (data.history || []).sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          console.log("🟢 Lịch sử sau khi sắp xếp:", sorted);
          setHistory(sorted);
        })
        .catch((err) => {
          console.error("🔴 Lỗi khi lấy lịch sử:", err);
        });
    } else {
      console.log("⚠️ user.id chưa sẵn sàng");
    }
  }, [user]);

  // ❗️Có thể thêm fallback nếu không có user hoặc lịch sử
  if (!user?.id || history.length === 0) {
    return null; // Hoặc return fallback UI tùy ý
  }

  return (
    <div className="px-4 sm:px-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">🕘 Recently listened</h2>
        <Link
          href="/history"
          className="text-sm text-blue-500 hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {history.slice(0, 6).map((item) => (
          <Link key={item._id} href={`/song/${item.song_id}`}>
            <div className="group cursor-pointer">
              <div className="aspect-square relative rounded-md overflow-hidden shadow-sm">
                <Image
                  src={item.song_info?.coverArt || "/placeholder.svg"}
                  alt={item.song_info?.title || "No Title"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-2 text-sm font-medium truncate">
                {item.song_info?.title || "Unknown Title"}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {item.song_info?.artist || "Unknown Artist"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
