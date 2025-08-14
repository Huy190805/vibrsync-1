"use client";

import dynamic from "next/dynamic";

const ListeningHistory = dynamic(() => import("../ListeningHistory"), {
  ssr: false,
  loading: () => <div className="text-white">📻 Đang tải lịch sử nghe...</div>,
});

export default function ListeningHistoryClient() {
  return <ListeningHistory />;
}
