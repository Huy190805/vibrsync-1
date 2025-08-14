"use client";

// ======= Import thư viện & component cần thiết =======
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Share2, PlusCircle, Eye } from "lucide-react";
import PopupPortal from "./PopupPortal";

// ======= Component hiển thị menu phụ trong album (More) =======
export default function AlbumMoreMenu({ artist, onShare, onAddToPlaylist }) {
  const [showMenu, setShowMenu] = useState(false); // Trạng thái hiển thị menu
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 }); // Vị trí của menu trên màn hình

  const buttonRef = useRef(null); // Tham chiếu đến nút "More"
  const menuRef = useRef(null);   // Tham chiếu đến phần tử menu hiển thị

  // ======= Bật / Tắt menu và định vị vị trí hiển thị =======
  const toggleMenu = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY + 8, left: rect.left });
    }
    setShowMenu(!showMenu);
  };

  // ======= Đóng menu khi click ra ngoài vùng menu =======
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* ======= Nút More (mở menu) ======= */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
          showMenu
            ? "bg-gradient-to-r from-[#D8BFD8] to-[#FF6A6A] text-white shadow-lg"
            : "bg-[#2A2A2A]/60 text-gray-200 hover:bg-[#2A2A2A]/80"
        }`}
      >
        <MoreHorizontal
          size={20}
          className="transition-transform duration-300 group-hover:rotate-90"
        />
        More
      </button>

      {/* ======= Menu hiển thị khi bật ======= */}
      {showMenu && (
        <PopupPortal>
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed w-60 backdrop-blur-xl bg-[#1f1f1f]/95 border border-[#97FFFF]/20 rounded-xl shadow-2xl z-[9999] overflow-hidden"
          >
            <div className="flex flex-col divide-y divide-[#97FFFF]/10">
              {/* Chia sẻ album */}
              <button
                onClick={() => {
                  onShare();
                  setShowMenu(false);
                }}
                className="group px-4 py-3 flex items-center gap-3 text-gray-200 hover:bg-[#97FFFF]/10 transition-all"
              >
                <Share2 size={18} className="group-hover:text-[#97FFFF] transition-colors" />
                Share Album
              </button>

              {/* Thêm vào playlist */}
              <button
                onClick={() => {
                  onAddToPlaylist();
                  setShowMenu(false);
                }}
                className="group px-4 py-3 flex items-center gap-3 text-gray-200 hover:bg-[#97FFFF]/10 transition-all"
              >
                <PlusCircle size={18} className="group-hover:text-[#97FFFF] transition-colors" />
                Add to Playlist
              </button>

              {/* Xem chi tiết nghệ sĩ nếu có */}
              {artist && (
                <Link
                  href={`/artist/${artist._id}`}
                  onClick={() => setShowMenu(false)}
                  className="group px-4 py-3 flex items-center gap-3 text-gray-200 hover:bg-[#97FFFF]/10 transition-all"
                >
                  <Eye size={18} className="group-hover:text-[#97FFFF] transition-colors" />
                  View Artist Details
                </Link>
              )}
            </div>
          </div>
        </PopupPortal>
      )}
    </div>
  );
}
