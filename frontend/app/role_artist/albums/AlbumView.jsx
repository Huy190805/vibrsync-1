import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge'; // Giả định Badge đã được sửa
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchSongsByIds } from '@/lib/api/songs';
import { motion } from 'framer-motion';

export default function AlbumView({ album, onClose }) {
  const { toast } = useToast();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (album?.songs && album.songs.length > 0) {
          const songsData = await fetchSongsByIds(album.songs);
          console.log("Songs response:", songsData);
          setSongs(songsData);
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20">
        <CardHeader className="border-b border-border relative">
          <CardTitle className="text-2xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            {album.title || "N/A"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
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
            <div className="space-y-2 text-foreground">
              <p className="text-lg font-medium">
                Title: {album.title || "N/A"}
              </p>
              <p>
                Release Year: {album.release_year || "N/A"}
              </p>
              <p>
                Genres:{" "}
                {album.genres?.length > 0 ? (
                  album.genres.map((genre, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-green-500/20 text-green-400 border border-green-500/30 mx-1 px-2.5 py-0.5 text-xs font-semibold">
                      {genre}
                    </span>
                  ))
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Songs</h3>
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
    </motion.div>
  );
}