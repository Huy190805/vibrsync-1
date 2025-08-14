"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Library, Music, Heart, ListMusic, PlusCircle,Compass, Play,Tags
} from "lucide-react";
import CustomCreatePlaylistModal from "@/components/playlist/CustomCreatePlaylistModal";
import { getAllPlaylists } from "@/lib/api/playlists";
import { getPlaylistById, deletePlaylist } from "@/lib/api/playlists";
import { useAuth } from "@/context/auth-context";
import { useMusic } from "@/context/music-context";
import PlaylistModal from "@/components/playlist/PlaylistModal";
import CustomAlert from "@/components/ui/CustomAlert";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { setContext, setContextId, updateSongsForContext, playSong, songs } = useMusic();
  const [playlists, setPlaylists] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null
  });

  // hàm mở alert
  const showAlert = (config) => {
    setAlertConfig({ open: true, ...config });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (title, description, isPublic) => {
    if (!user?.id) return;
    await createPlaylist({
      title,
      description,
      isPublic,
      creator: user.id,
    });
  };

  useEffect(() => {
    if (!user?.id) return;

    async function loadPlaylists() {
      try {
        const playlistsData = await getAllPlaylists(user.id);
        setPlaylists(playlistsData || []);
      } catch (e) {
        console.error("Failed to load playlists:", e);
      }
    }

    loadPlaylists();
  const handleUpdate = () => {
    loadPlaylists();
  };

  window.addEventListener("playlistsUpdated", handleUpdate);

  return () => {
    window.removeEventListener("playlistsUpdated", handleUpdate);
  };
}, [user?.id]);

  const isActive = (path) => pathname === path;

const handlePlayPlaylist = async (playlistId) => {
  setContext("playlist");
  setContextId(playlistId);

  // Cập nhật danh sách bài hát và chờ hoàn tất
  const newSongs = await updateSongsForContext("playlist", playlistId);

  // Nếu updateSongsForContext không return mảng, fallback về context.songs
  const finalSongs = Array.isArray(newSongs) && newSongs.length > 0
    ? newSongs
    : songs;

  // Phát bài đầu tiên nếu có
  if (finalSongs.length > 0) {
    playSong(finalSongs[0]);
  }
};


  return (
    <aside className="w-64 hidden md:flex flex-col bg-black/30 h-full overflow-y-auto scroll-container">
      <div className="p-6">
<Link
  href="/"
  className="group flex items-center gap-3 mb-8 cursor-pointer relative w-max"
>
  <div
    className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-visible bg-gradient-to-br from-purple-700 to-purple-900 shadow-lg"
  >
    {/* 3 vòng tròn sóng nhạc màu tím với hiệu ứng sóng như bạn muốn */}
    <span className="absolute w-14 h-14 rounded-full border-2 border-purple-400 animate-wave"></span>
    <span className="absolute w-14 h-14 rounded-full border-2 border-purple-400 animate-wave delay-300"></span>
    <span className="absolute w-14 h-14 rounded-full border-2 border-purple-400 animate-wave delay-600"></span>

    {/* Icon Music nhỏ hơn (w-9 h-9), nghiêng nhẹ sang phải, lắc nhẹ */}
    <svg
      className="w-9 h-9 relative z-10 animate-wobble-tilt"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transformOrigin: 'center bottom' }}
    >
      <defs>
        <linearGradient id="gradientMusic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Cột nốt nhạc */}
      <rect
        x="9"
        y="2"
        width="2"
        height="14"
        fill="url(#gradientMusic)"
        rx="1"
      />
      {/* Nốt nhạc tròn */}
      <circle cx="10" cy="19" r="4" fill="url(#gradientMusic)" />
      {/* Đường cong nối */}
      <path
        d="M11 2C13 3 16 4 16 7C16 9 14 11 12 11"
        stroke="url(#gradientMusic)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Sao lấp lánh xung quanh icon music */}
    <span className="absolute top-2 left-2 w-1.5 h-1.5 bg-white opacity-80 clip-star animate-sparkle"></span>
    <span className="absolute top-5 right-2 w-1 h-1 bg-white opacity-70 clip-star animate-sparkle delay-200"></span>
    <span className="absolute bottom-2 left-4 w-1 h-1 bg-white opacity-70 clip-star animate-sparkle delay-400"></span>
  </div>

<span className="fancy-text select-none">VibeSync</span>

  <style jsx>{`
    /* Sóng nhạc */
    @keyframes wave {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      70% {
        opacity: 0.1;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    .animate-wave {
      animation: wave 2s linear infinite;
    }
    .delay-300 {
      animation-delay: 0.3s;
    }
    .delay-600 {
      animation-delay: 0.6s;
    }

    /* Animation sparkle cho sao */
    @keyframes sparkle {
      0%, 100% {
        opacity: 0.6;
        transform: scale(1) rotate(0deg);
      }
      50% {
        opacity: 1;
        transform: scale(1.3) rotate(15deg);
      }
    }
    .animate-sparkle {
      animation: sparkle 1.5s ease-in-out infinite;
    }
    .animate-sparkle.delay-200 {
      animation-delay: 0.2s;
    }
    .animate-sparkle.delay-400 {
      animation-delay: 0.4s;
    }

    /* Hình sao */
    .clip-star {
      clip-path: polygon(
        50% 0%,
        61% 35%,
        98% 35%,
        68% 57%,
        79% 91%,
        50% 70%,
        21% 91%,
        32% 57%,
        2% 35%,
        39% 35%
      );
    }

    /* Text glow */
    .glow-text {
      text-shadow: 0 0 6px rgba(167, 139, 250, 0.8);
    }

    /* Animation lắc nghiêng sang phải */
    @keyframes wobble-tilt {
      0%, 100% {
        transform: rotate(8deg);
      }
      50% {
        transform: rotate(12deg);
      }
    }
    .animate-wobble-tilt {
      animation: wobble-tilt 3s ease-in-out infinite;
      transform-origin: center bottom;
    }
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&display=swap');

  .fancy-text {
    font-family: 'Baloo 2', cursive;
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    position: relative;
    display: inline-block;
    transform-origin: left bottom;
    transform: skew(-10deg);
    text-shadow:
      3px 0 0 #7c3aed,
      -3px 0 0 #7c3aed,
      0 3px 0 #7c3aed,
      0 -3px 0 #7c3aed,
      2px 2px 5px rgba(124, 58, 237, 0.7);
    letter-spacing: 0.1em;
  }

  .fancy-text::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #a78bfa, #f472b6, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    z-index: -1;
    filter: blur(4px);
  }
  `}</style>
</Link>

        <nav className="space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive("/") ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link href="/search" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive("/search") ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}>
            <Search size={20} />
            <span>Search</span>
          </Link>
          <Link href="/discovery" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
          isActive("/discovery") ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}>
          <Compass size={20} />
          <span>Discovery</span>
          </Link>
            <Link
          href="/genres"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
          isActive("/genres")
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
          >
          <Tags size={20} />
          <span>Topics & Genres</span>
          </Link>

          <Link href="/library" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            isActive("/library") ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}>
            <Library size={20} />
            <span>Your Library</span>
          </Link>
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider">Playlists</h3>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-gray-400 hover:text-white"
              title="Create new playlist"
            >
              <PlusCircle size={18} />
            </button>
          </div>

          <CustomCreatePlaylistModal
            open={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onPlaylistCreated={async () => {
              try {
                if (!user?.id) return;
                const latest = await getAllPlaylists(user.id);
                setPlaylists(latest || []);
              } catch (e) {
                console.error("Failed to refresh playlists:", e);
              }
            }}
            onSubmit={handleSubmit}
          />

          <div className="space-y-1">
            <Link
              href="/liked"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 text-gray-400 hover:text-white"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-400 rounded-sm">
                <Heart size={12} className="text-white" />
              </div>
              <span>Liked Songs</span>
            </Link>
{playlists.map((playlist) => (
  <div
    key={playlist.id}
    className="group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
    onContextMenu={(e) => {
      e.preventDefault();
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setActivePlaylist(playlist);
    }}
  >
    <button
      onClick={() => handlePlayPlaylist(playlist.id)}
      className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center"
    >
      <Play size={12} />
    </button>
    <Link
      href={`/playlist/${playlist.id}`}
      className="flex-1 text-gray-400 hover:text-white truncate"
    >
      {playlist.title}
    </Link>

    {/* Nút More */}
    <button
      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
      onClick={(e) => {
        e.stopPropagation();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setActivePlaylist(playlist);
      }}
    >
      ⋯
    </button>
  </div>
))}

{/* Popup menu màu tím */}
{activePlaylist && menuPosition && (
  <div
    className="absolute z-50 bg-purple-800 border border-purple-600 text-white rounded-md shadow-lg p-2 text-sm"
    style={{ top: menuPosition.y, left: menuPosition.x }}
    onMouseLeave={() => setActivePlaylist(null)}
  >
    <button
      className="block w-full text-left px-3 py-1 hover:bg-purple-700 rounded"
      onClick={() => {
        setEditingPlaylist(activePlaylist);
        setShowEditModal(true);
        setActivePlaylist(null);
      }}
    >
      ✏️ Edit Playlist
    </button>

<button
  className="block w-full text-left px-3 py-1 hover:bg-purple-700 rounded"
  onClick={() => {
    showAlert({
      type: "error",
      title: "Xóa Playlist",
      message: "Bạn có chắc chắn muốn xóa playlist này?",
      onConfirm: async () => {
        await deletePlaylist(activePlaylist.id);
        if (user?.id) {
          const latest = await getAllPlaylists(user.id);
          setPlaylists(latest || []);
        }
        window.dispatchEvent(new Event("playlistsUpdated"));
        setActivePlaylist(null);
        closeAlert();
      },
      onCancel: closeAlert
    });
  }}
>
  🗑️ Delete playlist
</button>

  <button
    className="block w-full text-left px-3 py-1 hover:bg-purple-700 rounded"
    onClick={() => {
      const link = `${window.location.origin}/playlist/${activePlaylist.slug}`;
      if (navigator.share) {
        navigator.share({
          title: activePlaylist.title,
          url: link,
        }).catch(err => console.error("Share failed", err));
      } else {
        alert("Sharing is not supported in this browser.");
      }
      setActivePlaylist(null);
    }}
  >
    📤 Share
  </button>

<button
  className="block w-full text-left px-3 py-1 hover:bg-purple-700 rounded"
  onClick={() => {
    const link = `${window.location.origin}/playlist/${activePlaylist.slug}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        showAlert({
          type: "success",
          title: "Copy Link",
          message: "✅ Link đã được sao chép vào clipboard!",
          onConfirm: closeAlert
        });
      })
      .catch(() => {
        showAlert({
          type: "error",
          title: "Lỗi",
          message: "❌ Không thể sao chép link!",
          onConfirm: closeAlert
        });
      });
    setActivePlaylist(null);
  }}
>
  🔗 Copy Link
</button>
  </div>
)}

{/* Modal Edit Playlist */}
{showEditModal && (
<PlaylistModal
  open={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setEditingPlaylist(null);
  }}
  editingPlaylist={editingPlaylist}
  onSuccess={async () => {
    if (!user?.id) return;
    try {
      const latest = await getAllPlaylists(user.id);
      setPlaylists(latest || []);
    } catch (e) {
      console.error("Failed to refresh playlists:", e);
    }
    window.dispatchEvent(new Event("playlistsUpdated"));
    setShowEditModal(false);
    setEditingPlaylist(null);
  }}
/>
)}
<CustomAlert
  open={alertConfig.open}
  type={alertConfig.type}
  title={alertConfig.title}
  message={alertConfig.message}
  onConfirm={alertConfig.onConfirm}
  onCancel={alertConfig.onCancel}
/>
          </div>
        </div>
      </div>
    </aside>
  );
}