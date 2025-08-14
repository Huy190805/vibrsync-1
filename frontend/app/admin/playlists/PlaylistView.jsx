"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function PlaylistView({ playlist, onClose }) {
  return (
    <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md border-2 border-green-500/20 shadow-lg rounded-xl">
      <CardHeader className="border-b border-green-500/20 p-4 flex justify-between items-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          Playlist Details: {playlist.title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-gray-300 border-gray-600 hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-300">Title</p>
            <p className="text-foreground">{playlist.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Description</p>
            <p className="text-foreground">{playlist.description || "No description"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Public</p>
            <Badge variant={playlist.isPublic ? "success" : "secondary"}>
              {playlist.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Shuffle</p>
            <Badge variant={playlist.isShuffle ? "success" : "secondary"}>
              {playlist.isShuffle ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Likes</p>
            <p className="text-foreground">{playlist.likes || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Thumbnail</p>
            {playlist.thumbnail ? (
              <img
                src={playlist.thumbnail}
                alt="Playlist Thumbnail"
                className="w-16 h-16 object-cover rounded-lg border border-gray-700 shadow-md"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
            ) : (
              <p className="text-foreground">No thumbnail</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Songs</p>
          <Table className="bg-gray-900/50 border border-green-500/20 rounded-lg">
            <TableHeader>
              <TableRow className="border-b border-green-500/20">
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Artist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(playlist.songs || []).map((song) => (
                <TableRow key={song.id} className="border-b border-green-500/20 hover:bg-gray-800/50">
                  <TableCell className="text-foreground">{song.title}</TableCell>
                  <TableCell className="text-foreground">{song.artist}</TableCell>
                </TableRow>
              ))}
              {(!playlist.songs || playlist.songs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-400">
                    No songs in this playlist
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}