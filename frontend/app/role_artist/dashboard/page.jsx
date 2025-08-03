"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { Music, User, Disc, PlayCircle, ChevronLeft, ChevronRight, Users } from "lucide-react";
import SongList from "@/components/songs/song-list";
import ArtistAbout from "./ArtistAbout";
import { useMusic } from "@/context/music-context";

export default function ArtistDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const { playSong, setContext } = useMusic();

  const [loading, setLoading] = useState(true);
  const [songIndex, setSongIndex] = useState(0);
  const [featuredSong, setFeaturedSong] = useState(null);
  const router = useRouter();

  const handleSongPrev = () => {
    const newIndex = (songIndex - 1 + songs.length) % songs.length;
    setSongIndex(newIndex);
    setFeaturedSong(songs[newIndex]);
  };

  const handleSongNext = () => {
    const newIndex = (songIndex + 1) % songs.length;
    setSongIndex(newIndex);
    setFeaturedSong(songs[newIndex]);
  };

  useEffect(() => {
    if (!user || user.role !== "artist") {
      router.push("/signin");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const res = await fetch("http://localhost:8000/api/artist/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch: ${res.status} - ${text}`);
        }

        const data = await res.json();
        setArtist(data);
        const validSongs = (data.songs || []).filter((song) => song.coverArt?.startsWith("http"));
        setSongs(validSongs);
        setAlbums(data.albums || []);
        if (validSongs.length > 0) {
          const randomIndex = Math.floor(Math.random() * validSongs.length);
          setFeaturedSong(validSongs[randomIndex]);
          setSongIndex(randomIndex);
        }
      } catch (err) {
        console.error("❌ Load failed:", err.message);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) loadData();
  }, [user, authLoading]);

  useEffect(() => {
    if (!songs.length) return;
    const interval = setInterval(() => {
      const newIndex = (songIndex + 1) % songs.length;
      setSongIndex(newIndex);
      setFeaturedSong(songs[newIndex]);
    }, 5000);
    return () => clearInterval(interval);
  }, [songs, songIndex]);

  if (authLoading || loading || !artist) {
    return <div className="flex justify-center items-center h-[60vh]">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header with default background image */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl h-[450px]"
        style={{
          backgroundImage: "url('/12pm.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-10 gap-6">
          <div className="w-[300px] h-[300px] rounded-2xl overflow-hidden ring-2 ring-purple-600 shadow-md hover:ring-4 hover:ring-purple-400 transition-all duration-300 relative">
            {featuredSong ? (
              <Image
                src={featuredSong.coverArt}
                alt={featuredSong.title}
                width={300}
                height={300}
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src={artist.image || "/placeholder.svg?height=128&width=128&query=artist+avatar"}
                alt="Artist Profile"
                width={250}
                height={250}
                className="object-cover w-full h-full"
              />
            )}
            {/* Song Controls */}
            {featuredSong && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
                <button
                  onClick={handleSongPrev}
                  className="bg-white/20 hover:bg-white/40 p-1 rounded-full text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleSongNext}
                  className="bg-white/20 hover:bg-white/40 p-1 rounded-full text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 text-white">
            <h2 className="text-purple-400 text-sm uppercase mb-1">Featured Song</h2>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {featuredSong ? featuredSong.title : artist.name}
            </h1>
            <p className="text-gray-200 mb-5 max-w-2xl">
              {featuredSong
                ? featuredSong.description || "Enjoy this specially curated track by the artist."
                : "Explore the artist's collection of songs."}
            </p>
            {/* Stats Section */}
            <div className="flex gap-6 mb-5">
              <div>
                <span className="text-gray-300 flex items-center gap-1">
                  <Music size={16} /> Songs
                </span>
                <p className="font-semibold text-white">{songs.length}</p>
              </div>
              <div>
                <span className="text-gray-300 flex items-center gap-1">
                  <Disc size={16} /> Albums
                </span>
                <p className="font-semibold text-white">{albums.length}</p>
              </div>
              <div>
                <span className="text-gray-300 flex items-center gap-1">
                  <Users size={16} /> Followers
                </span>
                <p className="font-semibold text-white">{artist.followers || 0}</p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
            {featuredSong && (
            <button
            onClick={() => {
            const startIndex = songs.findIndex((s) => s.id === featuredSong.id);
            const orderedSongs = [...songs.slice(startIndex), ...songs.slice(0, startIndex)];
            setSongs(orderedSongs);
            setContext("artist-dashboard");
            playSong(featuredSong);
            }}
            className="btn-primary flex items-center gap-2"
             >
           <PlayCircle size={18} /> Listen Now
            </button>
              )}
              <div className="btn-secondary cursor-default opacity-60">
                View Artist
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link href="/role_artist/profile/edit" className="btn-primary flex items-center gap-2">
          <User size={20} /> Edit Profile
        </Link>
        <Link href="/role_artist/songs" className="btn-primary flex items-center gap-2">
          <PlayCircle size={20} /> Manage Songs
        </Link>
        <Link href="/role_artist/albums" className="btn-primary flex items-center gap-2">
          <Disc size={20} /> Manage Albums
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-white/5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
          <h2 className="text-2xl font-bold mb-4">Recent Songs</h2>
          <SongList songs={songs.slice(0, 5)} />
          </div>
           <div>
           <h2 className="text-2xl font-bold mb-4">Recent Albums</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.slice(0, 4).map((album) => {
          const imageUrl = (() => {
          const raw = album.cover_image || album.cover_art;

          if (raw?.startsWith("http")) return raw;
          if (raw) return `http://localhost:8000/${raw.replace(/^\/+/, "")}`;

          // fallback nếu không có gì
          return "/placeholder.svg";
           })();

        return (
      <Link
      key={album.id}
      href={`/album/${album.id}`}
      className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition-all"
      >
      <div className="relative aspect-square w-full min-h-[200px] rounded-md overflow-hidden bg-gray-800">
        <Image
          src={imageUrl}
          alt={album.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold truncate">{album.title}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {artist?.name || "Unknown"}
        </p>
      </div>
      </Link>
      );
      })}
        </div>
         </div>
          </div>

          {/* About Section */}
          <div className="mt-10">
            <ArtistAbout artist={artist} />
          </div>
        </TabsContent>

        <TabsContent value="songs" className="mt-6">
          <SongList songs={songs} />
        </TabsContent>

      <TabsContent value="albums" className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {albums.map((album) => {
      const imageUrl = (() => {
      const raw = album.cover_image || album.cover_art;

      if (raw?.startsWith("http")) return raw;
      if (raw) return `http://localhost:8000/${raw.replace(/^\/+/, "")}`;

      // fallback nếu không có gì
      return "/placeholder.svg";
      })();
      return (
        <Link
          key={album.id}
          href={`/album/${album.id}`}
          className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition-all"
        >
          <div className="relative aspect-square w-full rounded-md overflow-hidden bg-gray-800">
            <Image
              src={imageUrl}
              alt={album.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="mt-2">
            <h3 className="text-sm font-semibold truncate">{album.title}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {artist?.name || "Unknown"}
            </p>
          </div>
        </Link>
       );
      })}
    </div>
    </TabsContent>
      </Tabs>
    </div>
  );
}