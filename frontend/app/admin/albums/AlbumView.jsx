import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchSongsByIds } from "@/lib/api/songs";
import { fetchArtistById } from "@/lib/api/artists";

export default function AlbumView({ album, onClose }) {
  const { toast } = useToast();
  const [songs, setSongs] = useState([]);
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (album?.songs && album.songs.length > 0) {
          const songsData = await fetchSongsByIds(album.songs);
          console.log("Songs response:", songsData);
          setSongs(songsData);
        }
        if (album?.artist_id) {
          const artistData = await fetchArtistById(album.artist_id);
          console.log("Artist response:", artistData);
          setArtist(artistData);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load album details",
        });
      }
    }
    loadData();
  }, [album, toast]);

  if (!album) {
    return <div className="text-center text-muted-foreground">No album selected</div>;
  }

  return (
    <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-2">
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Album Details: {album.title || "N/A"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {album.cover_art && (
            <img
              src={album.cover_art}
              alt={album.title || "Album"}
              className="w-48 h-48 object-cover rounded-md border border-border"
              onError={(e) => (e.target.src = "/placeholder.png")}
            />
          )}
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Title: {album.title || "N/A"}
            </p>
            <p className="text-foreground">
              Artist: {artist ? artist.name : "Loading..."}
            </p>
            <p className="text-foreground">
              Release Year: {album.release_year || "N/A"}
            </p>
            <div className="text-foreground">
              Genre: <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">{album.genres || "N/A"}</Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">Songs</h3>
          {songs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Genre</TableHead>
                </TableRow>
              </TableHeader>
<TableBody>
  {songs.map((song) => (
    <TableRow
      key={song.id}
      className="hover:bg-muted/50 border-border transition-colors"
    >
      <TableCell className="flex items-center gap-2">
        {song.coverArt ? (
          <img
            src={song.coverArt}
            alt={song.title}
            className="w-12 h-12 object-cover rounded border border-border shadow"
            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-foreground/50">
            No Image
          </div>
        )}
        <span>{song.title || "N/A"}</span>
      </TableCell>
      <TableCell>
        {song.duration
          ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
              .toString()
              .padStart(2, "0")}`
          : "N/A"}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="bg-green-500/20 text-green-400 border-green-500/30"
        >
          {song.genre || "N/A"}
        </Badge>
      </TableCell>
     </TableRow>
     ))}
    </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No songs found for this album</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}