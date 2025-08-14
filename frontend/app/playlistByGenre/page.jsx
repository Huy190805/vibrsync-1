"use client";

// Chỉ định rằng đây là Client Component trong Next.js, cho phép sử dụng các tính năng phía client như hooks.
import { Suspense, lazy } from "react";
import { useSearchParams } from "next/navigation";
import { useMusic } from "@/context/music-context";

// Tải chậm (lazy load) các thành phần để cải thiện hiệu suất, chỉ tải khi cần thiết.
const HeaderSection = lazy(() => import("@/components/playlistByGenre/HeaderSection"));
const SongList = lazy(() => import("@/components/playlistByGenre/SongList"));
const ToastNotification = lazy(() => import("@/components/playlistByGenre/ToastNotification"));

export default function PlaylistByGenrePage() {
  // Hook để truy cập các tham số truy vấn từ URL (ví dụ: title, genre, v.v.).
  const searchParams = useSearchParams();
  // Truy cập ngữ cảnh âm nhạc toàn cục để lấy thông tin bài hát hiện tại và trạng thái phát.
  const { currentSong, isPlaying } = useMusic();

  // Tạo dữ liệu danh sách phát từ các tham số URL, sử dụng giá trị dự phòng nếu thiếu tham số.
  const playlistData = {
    title: searchParams.get("title") || "Danh Sách Phát Đề Xuất",
    image: searchParams.get("image") || "/placeholder.svg",
    genre: searchParams.get("genre") || searchParams.get("title") || "Không Xác Định",
    subtitle: searchParams.get("subtitle") || "Những bài hát được chọn lọc cho bạn",
    time: searchParams.get("time") || "22/07/2025",
    followers: searchParams.get("followers") || "162",
  };

  // Kiểm tra xem bài hát đang phát có thuộc danh sách phát này không bằng cách so sánh contextId với thể loại.
  const isCurrentFromPlaylist = currentSong && currentSong.contextId === `genre-${playlistData.genre}`;

  return (
    // Container chính với nền gradient và padding responsive theo kích thước màn hình.
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#2a2a4e] to-[#3a3a6e] text-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Nội dung được căn giữa với chiều rộng tối đa để đảm bảo responsive */}
      <div className="max-w-7xl mx-auto">
        {/* Suspense hiển thị giao diện dự phòng trong khi thành phần HeaderSection đang tải */}
        <Suspense fallback={<div className="text-gray-400 text-center py-10">Loading title ...</div>}>
          <HeaderSection
            playlistData={playlistData}
            isCurrentFromPlaylist={isCurrentFromPlaylist}
          />
        </Suspense>
        {/* Suspense hiển thị giao diện dự phòng trong khi thành phần SongList đang tải */}
        <Suspense fallback={<div className="text-gray-400 text-center py-10">Loading song list ...</div>}>
          <SongList genre={playlistData.genre} isCurrentFromPlaylist={isCurrentFromPlaylist} />
        </Suspense>
        {/* Suspense cho ToastNotification, không hiển thị gì khi đang tải */}
        <Suspense fallback={null}>
          <ToastNotification />
        </Suspense>
      </div>
    </div>
  );
}