"use client";

import { use, useEffect, useState, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { Heart, MoreHorizontal, Play, Search, Shuffle } from "lucide-react";
import { useMusic } from "@/context/music-context";
import PlaylistSongList from "@/components/songs/playlist-song-list";
import SongList from "@/components/songs/search_playlistpage";
import PlaylistModal from "@/components/playlist/PlaylistModal";
import LikePlaylistButton from "@/components/liked-button/LikePlaylistButton";
import { getPlaylistById, deletePlaylist } from "@/lib/api/playlists";
import { getSongById } from "@/lib/api/songs";
import { triggerPlaylistRefresh } from "@/lib/api/playlist-refresh";
import { searchAll } from "@/lib/api/search";
import { debounce } from "lodash"; // Cần cài đặt lodash: npm install lodash

export default function PlaylistPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = Array.isArray(params?.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [playlist, setPlaylist] = useState(null);
  const [validSongs, setValidSongs] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const { setContext, setContextId, playSong, setSongs, toggleShuffle, isShuffling } = useMusic();

  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 🔍 Search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ songs: [], artists: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Lấy dữ liệu playlist với sessionStorage
  const fetchPlaylist = async () => {
    if (!id || typeof id !== "string") return notFound();

    // Kiểm tra sessionStorage
    const cachedPlaylist = sessionStorage.getItem(`playlist_${id}`);
    const cachedSongs = sessionStorage.getItem(`songs_${id}`);

    if (cachedPlaylist && cachedSongs) {
      setPlaylist(JSON.parse(cachedPlaylist));
      setValidSongs(JSON.parse(cachedSongs));
      return;
    }

    const playlistData = await getPlaylistById(id);
    if (!playlistData) return notFound();

    setPlaylist(playlistData);
    sessionStorage.setItem(`playlist_${id}`, JSON.stringify(playlistData));

    if (Array.isArray(playlistData.songIds)) {
      try {
        const fetchedSongs = await Promise.all(
          playlistData.songIds.map((songId) => getSongById(songId))
        );
        const validSongs = fetchedSongs.filter(Boolean);
        setValidSongs(validSongs);
        sessionStorage.setItem(`songs_${id}`, JSON.stringify(validSongs));
      } catch (err) {
        console.error("Failed to load songs:", err);
      }
    }
  };

  const refreshPlaylist = async () => {
    // Xóa cache khi làm mới
    sessionStorage.removeItem(`playlist_${id}`);
    sessionStorage.removeItem(`songs_${id}`);
    await fetchPlaylist();
  };

  const handleDeletePlaylist = async () => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await deletePlaylist(playlist.id);
      // Xóa cache khi xóa playlist
      sessionStorage.removeItem(`playlist_${id}`);
      sessionStorage.removeItem(`songs_${id}`);
      triggerPlaylistRefresh();
      window.dispatchEvent(new Event("playlistsUpdated"));
      router.push("/library");
    } catch (err) {
      console.error("Failed to delete playlist:", err);
      alert("Failed to delete playlist.");
    }
  };

  const handleEditPlaylist = (playlist) => {
    setShowMenu(false);
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(async () => {
      if (!query.trim()) {
        setSearchResults({ songs: [], artists: [] });
        refreshPlaylist();
        return;
      }
      try {
        const cachedSearch = sessionStorage.getItem(`search_${query}`);
        if (cachedSearch) {
          setSearchResults(JSON.parse(cachedSearch));
          return;
        }

        const result = await searchAll(query);
        const searchData = {
          songs: result.songs || [],
          artists: result.artists || [],
        };
        setSearchResults(searchData);
        sessionStorage.setItem(`search_${query}`, JSON.stringify(searchData));
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [query]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!playlist) return null;

  const firstSongCover = validSongs[0]?.coverArt || playlist.coverArt || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800/60 via-black to-black text-white">
      {/* Header */}
      <div className="p-6 pb-2 md:p-10 md:pb-4 flex flex-col md:flex-row gap-6 items-center md:items-end">
        <img
          src={firstSongCover}
          alt="cover"
          className="w-40 h-40 md:w-56 md:h-56 object-cover rounded shadow"
        />
        <div className="text-center md:text-left flex-1">
          <p className="uppercase text-xs font-semibold text-purple-300">Playlist</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-1">{playlist.title}</h1>
          <p className="text-gray-300 mt-2 text-sm">{playlist.description || "No description."}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {validSongs.length} {validSongs.length === 1 ? "song" : "songs"}
          </p>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => {
                if (!validSongs.length) return;
                setSongs(validSongs);
                setContext("playlist");
                setContextId(playlist.id);
                playSong(validSongs[0]);
              }}
              className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-full font-bold shadow flex items-center gap-2"
            >
              <Play size={18} /> Play
            </button>

            <button
              onClick={() => {
                if (!validSongs.length) return;
                toggleShuffle();
                setSongs(validSongs);
                setContext("playlist");
                setContextId(playlist.id);
              }}
              className={`px-6 py-2 rounded-full font-bold shadow flex items-center gap-2 transition-transform duration-300 hover:scale-105 ${
                isShuffling ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Shuffle size={18} /> Shuffle
            </button>

            <LikePlaylistButton playlistId={playlist._id} />

            {/* Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white hover:text-gray-300"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-purple-800 border border-purple-600 text-white rounded shadow-lg z-50">
                  <ul className="text-sm">
                    <li
                      className="px-4 py-2 hover:bg-purple-700 cursor-pointer"
                      onClick={() => handleEditPlaylist(playlist)}
                    >
                      Edit Playlist
                    </li>
                    <li className="px-4 py-2 hover:bg-purple-700 cursor-pointer">Share</li>
                    <li
                      className="px-4 py-2 hover:bg-purple-700 cursor-pointer"
                      onClick={handleDeletePlaylist}
                    >
                      Delete
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 md:px-10 mt-6">
        {isSearchOpen ? (
          <div className="relative max-w-md">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full p-3 pl-10 rounded-full bg-gradient-to-r from-purple-900 to-purple-800 text-white placeholder-purple-300 border border-purple-600 shadow focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              placeholder="Search songs or artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => {
                if (!query.trim()) setIsSearchOpen(false);
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none" />
          </div>
        ) : (
          <button
            className="p-3 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 text-white hover:from-purple-600 hover:to-purple-800 border border-purple-600 shadow-lg transition"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 pt-4 md:p-10 md:pt-6 space-y-10">
        {query.trim() ? (
          (() => {
            const artistSongs = (searchResults.artists || []).flatMap(
              (artist) => artist.songs || []
            );
            const allSongsMap = new Map();
            (searchResults.songs || []).forEach((s) => {
              allSongsMap.set(s._id || s.id, s);
            });
            artistSongs.forEach((s) => {
              if (!allSongsMap.has(s._id || s.id)) {
                allSongsMap.set(s._id || s.id, s);
              }
            });

            const combinedSongs = Array.from(allSongsMap.values());

            return combinedSongs.length > 0 ? (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Results</h2>
                <SongList
                  songs={combinedSongs.map((s) => ({
                    id: s.id || s._id,
                    title: s.title,
                    artist: s.artist?.name || s.artist,
                    artistId: s.artist?._id || s.artistId,
                    album: s.album?.trim() || "N/A",
                    duration: s.duration || 0,
                    coverArt: s.coverArt || "/placeholder.svg",
                    genre: s.genre,
                    publisher: s.publisher,
                    refreshPlaylist,
                  }))}
                />
              </div>
            ) : (
              <p className="text-gray-400">No results found for "{query}".</p>
            );
          })()
        ) : (
          <PlaylistSongList
            songs={validSongs}
            playlistId={playlist.id}
            onSongsChange={(newSongs) => {
              queueMicrotask(() => {
                setValidSongs(newSongs);
                sessionStorage.setItem(`songs_${id}`, JSON.stringify(newSongs));
                window.dispatchEvent(new Event("playlistsUpdated"));
              });
            }}
          />
        )}
      </div>

      {showEditModal && (
        <PlaylistModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPlaylist(null);
          }}
          editingPlaylist={editingPlaylist}
          onSuccess={async () => {
            // Xóa cache khi chỉnh sửa playlist
            sessionStorage.removeItem(`playlist_${id}`);
            sessionStorage.removeItem(`songs_${id}`);
            await fetchPlaylist();
            window.dispatchEvent(new Event("playlistsUpdated"));
            setShowEditModal(false);
            setEditingPlaylist(null);
          }}
        />
      )}
    </div>
  );
}