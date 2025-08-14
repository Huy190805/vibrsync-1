"use client";

import dynamic from "next/dynamic";

const TopListenStats = dynamic(() => import("../TopListenStats"), {
  ssr: false,
  loading: () => <div className="text-white">📊 Đang tải thống kê...</div>,
});

export default function TopListenStatsClient() {
  return <TopListenStats />;
}
