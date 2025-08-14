"use client";

import dynamic from "next/dynamic";

const RecommendSection = dynamic(() => import("../recommend-section"), {
  ssr: false,
  loading: () => <div className="text-white">📀 Đang tải gợi ý...</div>,
});

export default function RecommendSectionClient() {
  return <RecommendSection />;
}
