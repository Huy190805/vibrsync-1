"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:8000/api/history/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.history || []);
        })
        .catch((err) => {
          console.error("🔴 Lỗi khi tải lịch sử nghe:", err);
        });
    }
  }, [user]);

  if (!user?.id) {
    return <div className="p-4">Vui lòng đăng nhập để xem lịch sử nghe.</div>;
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">📜 Listening history</h1>


      {history.length === 0 ? (
        <p className="text-gray-500">Không có bài hát nào trong lịch sử.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li
              key={item._id}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Link href={`/song/${item.song_id}`} className="flex items-center gap-4 w-full">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src={item.song_info.coverArt || "/placeholder.svg"}
                    alt={item.song_info.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold truncate">{item.song_info.title}</div>
                  <div className="text-sm text-gray-500 truncate">{item.song_info.artist}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleString("vi-VN")}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}