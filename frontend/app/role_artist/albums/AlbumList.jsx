"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent,
} from "@/components/ui/tooltip";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchAlbums } from "./ArtistAlbumApi";

export default function AlbumList({ onAdd, onEdit, onDelete, onView }) {
  const { toast } = useToast();
  const [albums, setAlbums] = useState([]);
  const [songsMap, setSongsMap] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [albumSongs, setAlbumSongs] = useState({});

  const getCoverArtUrl = (path) => {
    if (!path) return "/placeholder.png";
    return path.startsWith("http") ? path : `http://localhost:8000/${path}`;
  };

useEffect(() => {
  async function loadAlbumsAndSongs() {
    try {
      const token = localStorage.getItem("token");

      const [albumsRes, songsRes] = await Promise.all([
        fetchAlbums(),
        fetch("http://localhost:8000/api/artist/songs", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
      ]);

      setAlbums(Array.isArray(albumsRes) ? albumsRes : []);

      const map = {};
      console.log("🎵 Raw Songs:", songsRes.songs);

      for (const song of songsRes.songs || []) {
        const songId = song.id?.toString() || song._id?.toString(); // lấy cả id và _id
        if (songId) {
          map[songId] = song.title;
          console.log("🆔 Song ID Mapped:", songId, "→", song.title);
        } else {
          console.warn("⚠️ Song missing id/_id:", song);
        }
      }

      setSongsMap(map);
      console.log("✅ SongsMap:", map);

      // Log từng album's song ids
      for (const album of albumsRes || []) {
        console.log("📀 Album:", album.title, "| Songs:", album.songs?.map(id => id?.toString()));
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load albums or songs." });
      setAlbums([]);
    }
  }

  loadAlbumsAndSongs();
}, [toast]);




  const filteredAlbums = albums.filter((album) =>
    [album.title ?? "", (album.genres || []).join(", "), album.release_year?.toString() ?? ""]
      .some((field) =>
        typeof field === "string" &&
        field.toLowerCase().includes(search.toLowerCase())
      )
  );

  const totalPages = Math.max(1, Math.ceil(filteredAlbums.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredAlbums, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlbums = filteredAlbums.slice(startIndex, startIndex + itemsPerPage);

  return (
    <TooltipProvider>
      <div className="space-y-6 px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Your Albums
            </h1>
            <p className="text-muted-foreground text-lg">Manage your music albums</p>
          </div>
          <Button
            onClick={onAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25"
          >
            <Plus className="h-4 w-4" />
            Add Album
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20">
          <CardHeader className="border-b border-border">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">All Albums ({filteredAlbums.length})</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search albums..."
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
                  <TableHead>Release Year</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Songs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAlbums.length > 0 ? (
                  paginatedAlbums.map((album) => {
                    const songTitles = (album.songs || []).map(
                      (id) => songsMap[id] || "Unknown"
                    );
                    const visibleSongs = songTitles.slice(0, 3);
                    const hiddenCount = songTitles.length - visibleSongs.length;

                    return (
                      <TableRow key={album.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={getCoverArtUrl(album.cover_art)}
                              alt={album.title || "Album"}
                              className="w-12 h-12 object-cover rounded-md border border-border"
                            />
                            <p className="font-medium text-foreground">{album.title || "N/A"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{album.release_year || "N/A"}</TableCell>
                        <TableCell className="flex flex-wrap gap-1 max-w-xs">
                          {(album.genres || []).slice(0, 2).map((genre, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-green-500/20 text-green-400 border-green-500/30"
                            >
                              {genre}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{album.description || "N/A"}</TableCell>
                        <TableCell className="max-w-xs text-sm text-gray-300">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-pointer truncate">
                                {visibleSongs.join(", ")}
                                {hiddenCount > 0 && (
                                  <span className="text-muted-foreground ml-1">
                                    +{hiddenCount} more
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            {songTitles.length > 3 && (
                              <TooltipContent className="bg-background text-foreground border border-border shadow-lg rounded-md max-w-xs">
                                <ul className="list-disc pl-5 text-sm">
                                  {songTitles.map((title, index) => (
                                    <li key={index}>{title}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(album)}
                              className="hover:bg-blue-500/20 hover:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(album)}
                              className="hover:bg-green-500/20 hover:text-green-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(album.id, album.title)}
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No albums found
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
    </TooltipProvider>
  );
}
