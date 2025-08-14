"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaylists } from "./playlistApi";

export default function PlaylistTable({ playlists, onAdd, onEdit, onDelete, onView }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: fetchedPlaylists, isLoading, error } = useQuery({
    queryKey: ["playlists", currentPage, searchTerm],
    queryFn: () => fetchPlaylists({ skip: (currentPage - 1) * itemsPerPage, limit: itemsPerPage, search: searchTerm }),
    staleTime: 5 * 60 * 1000,
  });

  const displayPlaylists = Array.isArray(fetchedPlaylists) ? fetchedPlaylists : fetchedPlaylists?.playlists || [];

  const filteredPlaylists = useMemo(() => {
    return displayPlaylists.filter((playlist) =>
      playlist.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayPlaylists, searchTerm]);

  const totalPages = Math.ceil((fetchedPlaylists?.total || 0) / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-1/3">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700 text-foreground"
          />
        </div>
        <Button
          onClick={onAdd}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Playlist
        </Button>
      </div>

      {isLoading && <div className="text-center text-gray-400">Loading playlists...</div>}
      {error && <div className="text-center text-red-400">Error loading playlists: {error.message}</div>}

      <Table className="bg-gray-900/50 border border-green-500/20 rounded-lg">
        <TableHeader>
          <TableRow className="border-b border-green-500/20">
            <TableHead className="text-gray-300">User</TableHead>
            <TableHead className="text-gray-300">Songs</TableHead>
            <TableHead className="text-gray-300">Public</TableHead>
            <TableHead className="text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlaylists.map((playlist) => (
            <TableRow key={playlist.id} className="border-b border-green-500/20 hover:bg-gray-800/50">
              <TableCell className="text-foreground">{playlist.title}</TableCell>
              <TableCell className="text-foreground">
           <div className="flex flex-col gap-2">
          {playlist.songs?.slice(0, 3).map((song) => (
          <div key={song.id} className="flex items-center gap-2">
          <img
            src={song.coverArt || "/placeholder.png"}
            alt={song.title}
            className="w-8 h-8 object-cover rounded"
           />
          <span className="text-sm truncate">{song.title}</span>
          </div>
          ))}
          {playlist.songs?.length > 3 && (
          <span className="text-xs text-gray-400">+ {playlist.songs.length - 3} more</span>
           )}
           </div>
            </TableCell>
              <TableCell>
                <Badge variant={playlist.isPublic ? "success" : "secondary"}>
                  {playlist.isPublic ? "Public" : "Private"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(playlist)}
                    className="text-green-400 border-green-500/30 hover:bg-green-500/20"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(playlist)}
                    className="text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(playlist.id, playlist.title)}
                    className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          Previous
        </Button>
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
}