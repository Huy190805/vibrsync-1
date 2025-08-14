import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchArtistById } from "../artists/artistsApi"; // Sửa import

export default function AlbumList({ albums, onAdd, onEdit, onDelete, onView }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [artists, setArtists] = useState({});
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadArtists() {
      try {
        const artistIds = [...new Set(albums.map((album) => album.artist_id).filter(id => id && typeof id === "string" && id.length === 24))];
        console.log("Artist IDs to fetch:", artistIds);
        if (artistIds.length === 0) {
          console.warn("No valid artist IDs found in albums");
          return;
        }
        const artistPromises = artistIds.map((id) =>
          fetchArtistById(id)
            .then((artist) => {
              console.log(`Fetched artist ${id}:`, artist);
              return { [id]: artist?.name || "Unknown Artist" };
            })
            .catch((error) => {
              console.warn(`Failed to fetch artist ${id}:`, error.message);
              return { [id]: "Unknown Artist" };
            })
        );
        const artistData = await Promise.all(artistPromises);
        const artistMap = Object.assign({}, ...artistData);
        console.log("Artists map:", artistMap);
        setArtists(artistMap);
      } catch (err) {
        console.error("Fetch artists error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load artists",
        });
      }
    }
    if (albums.length > 0) {
      loadArtists();
    }
  }, [albums, toast]);

  const filteredAlbums = albums.filter((album) =>
    [
      album.title,
      artists[album.artist_id] || "N/A",
      album.genre || "",
    ].some((field) => typeof field === "string" && field.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredAlbums.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredAlbums, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlbums = filteredAlbums.slice(startIndex, startIndex + itemsPerPage);

  console.log("Albums:", albums, "Filtered albums:", filteredAlbums, "Paginated albums:", paginatedAlbums);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Albums
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

      <Card className="bg-card/50 backdrop-blur-sm border-2">
        <CardHeader className="border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">All Albums ({filteredAlbums.length})</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search albums..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-foreground bg-background border-border focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Release Year</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAlbums.length > 0 ? (
                paginatedAlbums.map((album) => (
                  <TableRow key={album.id} className="hover:bg-muted/50 border-border transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {album.cover_art && (
                          <img
                            src={album.cover_art}
                            alt={album.title || "Album"}
                            className="w-12 h-12 object-cover rounded-md border border-border"
                            onError={(e) => (e.target.src = "/placeholder.png")}
                          />
                        )}
                        <p className="font-medium text-foreground">{album.title || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{artists[album.artist_id] || "N/A"}</TableCell>
                    <TableCell>{album.release_year || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        {album.genres || "N/A"}
                      </Badge>
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
                          onClick={() => onDelete(album.id, album.title || "Album")}
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No albums found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
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