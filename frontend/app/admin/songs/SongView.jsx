// SongView.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchAlbumsIncludingSong } from "@/lib/api/albums";
import { fetchArtistById } from "@/lib/api/artists";
import { fetchSongsByArtist } from "@/lib/api/songs";

export default function SongView({ song, onClose }) {
  const { toast } = useToast();
  const [albums, setAlbums] = useState([]);
  const [artist, setArtist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (!song) return;

        const cachedArtists = JSON.parse(sessionStorage.getItem("artistCache") || "{}");

        // 1. Load Artist
        if (song.artistId) {
          if (cachedArtists[song.artistId]) {
            setArtist({ name: cachedArtists[song.artistId] });
          } else {
            const artistData = await fetchArtistById(song.artistId);
            setArtist(artistData);
            sessionStorage.setItem("artistCache", JSON.stringify({
              ...cachedArtists,
              [song.artistId]: artistData?.name || "Unknown Artist",
            }));
          }
        }

        // 2. Load Albums
        const cachedAlbumMap = JSON.parse(sessionStorage.getItem("albumSongMap") || "{}");
        let albumList = [];

        const rawFromCache = cachedAlbumMap[song.id];
        if (rawFromCache && Array.isArray(rawFromCache) && rawFromCache[0]?.title) {
          albumList = rawFromCache;
        } else {
          albumList = await fetchAlbumsIncludingSong(song.id);
          sessionStorage.setItem("albumSongMap", JSON.stringify({
            ...cachedAlbumMap,
            [song.id]: albumList
          }));
        }

        // 3. Load Artist names for albums
        const albumArtistIds = [...new Set(albumList.map((a) => a.artist_id).filter(Boolean))];
        const missingIds = albumArtistIds.filter((id) => !cachedArtists[id]);

        const fetched = await Promise.all(
          missingIds.map((id) =>
            fetchArtistById(id).then((a) => ({ [id]: a?.name || "Unknown Artist" }))
          )
        );

        const updatedArtistCache = { ...cachedArtists, ...Object.assign({}, ...fetched) };
        sessionStorage.setItem("artistCache", JSON.stringify(updatedArtistCache));

        // Gán tên nghệ sĩ cho album
        const albumsWithArtist = albumList.map((album) => ({
          ...album,
          artistName: updatedArtistCache[album.artist_id] || "Unknown Artist",
        }));

        setAlbums(albumsWithArtist);

        // 4. Load all songs by artist
        const songCacheKey = `artistSongs-${song.artistId}`;
        const cachedSongs = JSON.parse(sessionStorage.getItem(songCacheKey) || "[]");
        if (cachedSongs.length > 0) {
          setAllSongs(cachedSongs);
        } else {
          const { songs: songsData } = await fetchSongsByArtist(song.artistId);
          setAllSongs(songsData);
          sessionStorage.setItem(songCacheKey, JSON.stringify(songsData));
        }

      } catch (err) {
        console.error("Error loading data:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load song details",
        });
      }
    }

    loadData();
  }, [song, toast]);

  if (!song) {
    return <div className="text-center text-muted-foreground">No song selected</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-2 border-green-500/20 shadow">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Song Details: {song.title || "N/A"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {song.coverArt && (
            <img
              src={song.coverArt}
              alt={song.title}
              className="w-48 h-48 object-cover rounded-md border border-border"
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            />
          )}
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Title: {song.title || "N/A"}</p>
            <p className="text-foreground">Artist: {artist?.name || "N/A"}</p>
            <p className="text-foreground">Release Year: {song.releaseYear || "N/A"}</p>
            <div className="text-foreground">
              Genre:{" "}
              {song.genre?.length ? (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-400 border-green-500/30"
                >
                  {song.genre.join(", ")}
                </Badge>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">Albums containing this song</h3>
          {albums.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Genre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {albums.map((album) => (
                  <TableRow key={album.id}>
                    <TableCell className="flex items-center gap-2">
                      {album.cover_art ? (
                        <img
                          src={album.cover_art}
                          alt={album.title}
                          className="w-12 h-12 object-cover rounded border border-border shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-foreground/50">
                          No Image
                        </div>
                      )}
                      <span>{album.title || "N/A"}</span>
                    </TableCell>
                    <TableCell>{album.artistName}</TableCell>
                    <TableCell>{album.release_year || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {album.genres?.join(", ") || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No albums found for this song</p>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">All Songs by this Artist</h3>
          {allSongs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Genre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSongs.map((songItem) => (
                  <TableRow key={songItem.id} className="hover:bg-muted/50 border-border transition-colors">
                    <TableCell className="flex items-center gap-2">
                      {songItem.coverArt ? (
                        <img
                          src={songItem.coverArt}
                          alt={songItem.title}
                          className="w-12 h-12 object-cover rounded border border-border shadow"
                          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-foreground/50">
                          No Image
                        </div>
                      )}
                      <span>{songItem.title || "N/A"}</span>
                    </TableCell>
                    <TableCell>
                      {songItem.duration
                        ? `${Math.floor(songItem.duration / 60)}:${(songItem.duration % 60).toString().padStart(2, '0')}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {songItem.genre || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No songs available by this artist</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
