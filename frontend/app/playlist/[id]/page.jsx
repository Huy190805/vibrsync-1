"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, MoreHorizontal, Play, Search } from "lucide-react";

import PlaylistSongList from "@/components/songs/playlist-song-list";
import SongList from "@/components/songs/search_playlistpage";
import ArtistCard from "@/components/artist/ArtistCard";
import PlaylistModal from "@/components/playlist/PlaylistModal";

import { getPlaylistById, deletePlaylist } from "@/lib/api/playlists";
import { getSongById } from "@/lib/api/songs";
import { triggerPlaylistRefresh } from "@/lib/api/playlist-refresh";
import { searchAll } from "@/lib/api/search";
import LikePlaylistButton from "@/components/liked-button/LikePlaylistButton";

export default function PlaylistPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const id = Array.isArray(params?.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [playlist, setPlaylist] = useState(null);
  const [validSongs, setValidSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(true);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 🔍 Search State
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ songs: [], artists: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // 🧠 Fetch Playlist metadata
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetch = async () => {
      try {
        const playlistData = await getPlaylistById(id);
        if (!playlistData) {
          router.replace("/not-found"); // safer than notFound() inside async
          return;
        }
        setPlaylist(playlistData);
        setSongsLoading(true);

        if (Array.isArray(playlistData.songIds)) {
          const songFetches = await Promise.allSettled(playlistData.songIds.map(getSongById));
          const songs = songFetches
            .filter((r) => r.status === "fulfilled" && r.value)
            .map((r) => r.value);
          setValidSongs(songs);
        }
      } catch (err) {
        console.error("Failed to fetch playlist:", err);
      } finally {
        setSongsLoading(false);
      }
    };

    fetch();
  }, [id]);

  // ⛔ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // 🔍 Smart Search
  useEffect(() => {
    const fetchSearch = async () => {
      if (!query.trim()) {
        setSearchResults({ songs: [], artists: [] });
        return;
      }
      try {
        const result = await searchAll(query);
        setSearchResults({
          songs: result.songs || [],
          artists: result.artists || [],
        });
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(() => fetchSearch(), 200);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!playlist) {
    return <div className="p-6 text-white">Loading playlist...</div>;
  }

  const firstSongCover = validSongs[0]?.coverArt || playlist.coverArt || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800/60 via-black to-black text-white">
      {/* Header */}
      <div className="p-6 pb-2 md:p-10 md:pb-4 flex flex-col md:flex-row gap-6 items-center md:items-end">
        <img src={firstSongCover} alt="cover" className="w-40 h-40 md:w-56 md:h-56 object-cover rounded shadow" />
        <div className="text-center md:text-left flex-1">
          <p className="uppercase text-xs font-semibold text-purple-300">Playlist</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-1">{playlist.title}</h1>
          <p className="text-gray-300 mt-2 text-sm">{playlist.description || "No description."}</p>
          <p className="text-sm text-neutral-400 mt-1">{validSongs.length} song(s)</p>

          <div className="flex items-center gap-4 mt-4">
            <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-full font-bold shadow">
              Play
            </button>
            <LikePlaylistButton playlistId={playlist._id} />
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} className="text-white hover:text-gray-300">
                <MoreHorizontal className="w-6 h-6" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-black border border-purple-700 text-white rounded shadow-lg z-50">
                  <ul className="text-sm">
                    <li className="px-4 py-2 hover:bg-purple-700 cursor-pointer" onClick={() => handleEditPlaylist(playlist)}>Edit Playlist</li>
                    <li className="px-4 py-2 hover:bg-purple-700 cursor-pointer">Share</li>
                    <li className="px-4 py-2 hover:bg-purple-700 cursor-pointer" onClick={async () => {
                      const confirmed = confirm("Delete this playlist?");
                      if (confirmed) {
                        await deletePlaylist(playlist.id);
                        triggerPlaylistRefresh();
                        router.push("/library");
                      }
                    }}>Delete</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 md:px-10 mt-6">
        {isSearchOpen ? (
          <div className="relative max-w-md">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full p-3 pl-10 rounded-full bg-gradient-to-r from-purple-900 to-purple-800 text-white placeholder-purple-300 border border-purple-600 shadow"
              placeholder="Search songs or artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query.trim() && setIsSearchOpen(false)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
          </div>
        ) : (
          <button
            className="p-3 rounded-full bg-gradient-to-br from-purple-700 to-purple-900 text-white hover:from-purple-600 hover:to-purple-800 border border-purple-600 shadow-lg"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-4 md:p-10 md:pt-6 space-y-10">
        {query.trim() ? (
          <>
            {searchResults.songs.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Songs</h2>
                <SongList
                  songs={searchResults.songs.map((s) => ({
                    id: s.id || s._id,
                    title: s.title,
                    artist: s.artist?.name || s.artist,
                    artistId: s.artist?._id || s.artistId,
                    album: s.album?._id || s.album,
                    duration: s.duration || 0,
                    coverArt: s.coverArt || "/placeholder.svg",
                    genre: s.genre,
                    publisher: s.publisher,
                    refreshPlaylist: () => {}, // no refresh while searching
                  }))}
                />
              </div>
            )}
            {searchResults.artists.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.artists.map((artist) => (
                    <ArtistCard key={artist._id} artist={artist} />
                  ))}
                </div>
              </div>
            )}
            {searchResults.songs.length === 0 && searchResults.artists.length === 0 && (
              <p className="text-gray-400">No results found for "{query}".</p>
            )}
          </>
        ) : songsLoading ? (
          <p className="text-purple-300">Loading songs...</p>
        ) : (
          <PlaylistSongList songs={validSongs} playlistId={playlist.id} />
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
            await getPlaylistById(id).then(setPlaylist);
            setShowEditModal(false);
            setEditingPlaylist(null);
          }}
        />
      )}
    </div>
  );
}
