"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Library, Music, Heart, ListMusic, PlusCircle,Compass, Play,Tags
} from "lucide-react";
import CustomCreatePlaylistModal from "@/components/playlist/CustomCreatePlaylistModal";
import { getAllPlaylists } from "@/lib/api/playlists";
import { useAuth } from "@/context/auth-context";
import { useMusic } from "@/context/music-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { setContext, setContextId, updateSongsForContext, playSong, songs } = useMusic();
  const [playlists, setPlaylists] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
  }, [user]);

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
     className="group flex items-center gap-3 mb-8 cursor-pointer"
     >
    <div className="bg-gradient-to-br from-purple-600 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-active:rotate-180">
    <Music
      size={22}
      className="text-white animate-wobble transition-transform duration-300"
    />
    </div>
     <span className="text-2xl font-bold text-white glow-text">
      VibeSync
    </span>
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
              <div key={playlist.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}