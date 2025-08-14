"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchArtistById, fetchAlbums } from "./ArtistsongApi";

export default function SongList({ songs, onAdd, onEdit, onDelete, onView }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [artists, setArtists] = useState({});
  const [songAlbumMap, setSongAlbumMap] = useState({});
  const itemsPerPage = 10;

useEffect(() => {
  async function loadArtistsAndAlbums() {
    try {
      const artistIds = [
        ...new Set(
          songs
            .flatMap((song) => [
              song.artistId,
              ...(song.contributingArtistIds || []),
            ])
            .filter((id) => id && typeof id === "string")
        ),
      ];

      const artistPromises = artistIds.map((id) =>
        fetchArtistById(id)
          .then((artist) => ({ [id]: artist?.name || "Unknown Artist" }))
          .catch(() => ({ [id]: "Unknown Artist" }))
      );
      const artistData = await Promise.all(artistPromises);
      setArtists(Object.assign({}, ...artistData));

      const albums = await fetchAlbums();

      const albumMap = {};
      for (const album of albums) {
        for (const songId of album.songs || []) {
          const key = typeof songId === "object" && songId.$oid ? songId.$oid : songId;
          if (!albumMap[key]) {
            albumMap[key] = [];
          }
          albumMap[key].push(album.title);
        }
      }

      setSongAlbumMap(albumMap);
    } catch (err) {
      console.error("❌ Failed to load artists/albums:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load artists or albums",
      });
    }
  }

  if (songs.length > 0) {
    loadArtistsAndAlbums();
  }
}, [songs, toast]);


  const filteredSongs = songs.filter((song) =>
    [
      song.title,
      artists[song.artistId] || "N/A",
      song.genre?.join(", ") || "",
      (songAlbumMap[song.id] || []).join(", "),
    ].some(
      (field) =>
        typeof field === "string" &&
        field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredSongs, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSongs = filteredSongs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-6 px-6 py-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Your Songs
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your music songs
          </p>
        </div>
        <Button
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25"
        >
          <Plus className="h-4 w-4" />
          Add Song
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20">
        <CardHeader className="border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              All Songs ({filteredSongs.length})
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search songs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Artists</TableHead>
                <TableHead>Albums</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Genres</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSongs.length > 0 ? (
                paginatedSongs.map((song) => {
                  const mainArtist = artists[song.artistId] || "N/A";
                  const contributing = (song.contributingArtistIds || []).map(
                    (id) => artists[id] || "N/A"
                  );
                  const allArtists = [mainArtist, ...contributing];
                  const displayArtists = allArtists.slice(0, 2);
                  const remainArtist = allArtists.length - displayArtists.length;

                  const albumTitles = songAlbumMap[song.id] || ["N/A"];
                  const displayAlbums = albumTitles.slice(0, 2);
                  const remainAlbums = albumTitles.length - displayAlbums.length;

                  const genres = song.genre || [];
                  const displayGenres = genres.slice(0, 2);
                  const remainGenres = genres.length - displayGenres.length;

                  return (
                    <TableRow key={song.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {song.coverArt && (
                            <img
                              src={song.coverArt}
                              alt={song.title}
                              className="w-12 h-12 object-cover rounded border border-gray-700"
                            />
                          )}
                          {song.title || <span className="text-gray-400 italic">Untitled</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative group cursor-pointer">
                          {displayArtists.join(", ")}
                          {remainArtist > 0 && ` +${remainArtist}`}
                          <div className="hidden group-hover:block absolute z-10 top-full left-0 bg-gray-800 text-white text-xs p-2 rounded shadow border mt-1 whitespace-nowrap">
                            {allArtists.join(", ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative group cursor-pointer">
                          {displayAlbums.join(", ")}
                          {remainAlbums > 0 && ` +${remainAlbums}`}
                          <div className="hidden group-hover:block absolute z-10 top-full left-0 bg-gray-800 text-white text-xs p-2 rounded shadow border mt-1 whitespace-nowrap">
                            {albumTitles.join(", ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{song.releaseYear || "N/A"}</TableCell>
                      <TableCell>
                        {song.duration
                          ? `${Math.floor(song.duration / 60)}:${String(
                              song.duration % 60
                            ).padStart(2, "0")}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="relative group cursor-pointer">
                          {displayGenres.join(", ")}
                          {remainGenres > 0 && ` +${remainGenres}`}
                          <div className="hidden group-hover:block absolute z-10 top-full left-0 bg-gray-800 text-white text-xs p-2 rounded shadow border mt-1 whitespace-nowrap">
                            {genres.join(", ")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(song)}
                            className="hover:bg-blue-500/20 hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(song)}
                            className="hover:bg-green-500/20 hover:text-green-400"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(song.id, song.title || "Song")}
                            className="hover:bg-red-500/20 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No songs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-green-500/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}