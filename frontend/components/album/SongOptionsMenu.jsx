"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PopupPortal from "./PopupPortal";
import SongActionsMenu from "../songs/song-actions-menu";

export default function SongOptionsMenu({ song, anchorRef, onClose }) {
  const popupRef = useRef(null);

  // Tọa độ hiển thị popup
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  // 👉 Tính toán vị trí popup dựa vào vị trí nút nhấn (anchorRef)
  useEffect(() => {
    if (anchorRef) {
      const rect = anchorRef.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      const popupWidth = 305;
      const padding = 8;

      let left = rect.right + scrollX + padding;
      const top = rect.bottom + scrollY + padding;

      // Nếu vượt quá màn hình, hiển thị sang trái
      if (left + popupWidth > window.innerWidth) {
        left = rect.left + scrollX - popupWidth - padding;
      }

      setPopupPos({ top, left });
    }
  }, [anchorRef]);

  // 👉 Đóng popup nếu click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 👉 Nếu chưa có dữ liệu bài hát thì không hiển thị
  if (!song) return null;

  // 👉 Copy liên kết bài hát vào clipboard
  const handleCopyLink = () => {
    const link = `${window.location.origin}/song/${song.id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
    onClose();
  };

  return (
    <PopupPortal>
      <div
        ref={popupRef}
        className="fixed w-72 bg-[#181818] text-white rounded-xl shadow-xl z-50 p-4 animate-fadeIn"
        style={{ top: popupPos.top, left: popupPos.left }}
      >
        {/* Phần hiển thị thông tin bài hát */}
        <div className="flex gap-3 items-start">
          <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0">
            <Image
              src={song.coverArt || "/placeholder.svg"}
              alt="cover"
              fill
              className="object-cover"
            />
          </div>

          {/* Thông tin tên bài hát, nghệ sĩ */}
          <div className="flex-1 group relative">
            <div className="font-semibold text-base truncate group-hover:underline">
              {song.title}
            </div>
            <div className="text-sm text-gray-400">{song.artist}</div>

            {/* Tooltip hiển thị thêm thông tin album/genre/publisher */}
            <div className="absolute bottom-full left-0 mb-2 w-max bg-black/90 text-xs text-white px-3 py-2 rounded hidden group-hover:block z-50 whitespace-nowrap">
              <div><strong>Album:</strong> {song.album || "Unknown"}</div>
              <div>
                <strong>Genre:</strong>{" "}
                {Array.isArray(song.genre)
                  ? song.genre.join(", ")
                  : song.genre || "Unknown"}
              </div>
              <div><strong>Publisher:</strong> {song.publisher || "Unknown"}</div>
            </div>
          </div>
        </div>

        {/* Các tùy chọn hành động */}
        <div className="mt-4 border-t border-white/10 pt-3 text-sm space-y-2">
          <SongActionsMenu song={song} onClose={onClose} />
          <div className="hover:bg-white/10 rounded p-2 cursor-pointer">Lyrics</div>
          <div className="hover:bg-white/10 rounded p-2 cursor-pointer">Play Next</div>
          <div className="hover:bg-white/10 rounded p-2 cursor-pointer">Block</div>
          <div
            className="hover:bg-white/10 rounded p-2 cursor-pointer"
            onClick={handleCopyLink}
          >
            Copy Link
          </div>
        </div>
      </div>
    </PopupPortal>
  );
}
