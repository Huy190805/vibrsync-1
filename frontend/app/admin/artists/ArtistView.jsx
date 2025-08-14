import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchSongsByArtist } from '@/lib/api/songs';
import { fetchAlbumsByArtist } from '@/lib/api/albums';

export function ArtistView({ artist, onClose }) {
  const { toast } = useToast();
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch songs by artist
        if (artist?.id) {
          const { songs: songsData } = await fetchSongsByArtist(artist.id);
          console.log("Songs response:", songsData);
          setSongs(songsData);
        }

        // Fetch albums by artist
        if (artist?.id) {
          const { albums: albumsData } = await fetchAlbumsByArtist(artist.id);
          console.log("Albums response:", albumsData);
          setAlbums(albumsData);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load artist details",
        });
      }
    }
    loadData();
  }, [artist, toast]);

  return (
    <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-2 border-blue-500/20">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          View Artist: {artist?.name || "N/A"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="basic" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Details
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div>
              <Label className="text-sm font-medium text-foreground">Artist Name</Label>
              <p className="mt-1 text-foreground bg-background border border-border rounded-md p-2">
                {artist?.name || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Biography</Label>
              <p className="mt-1 text-foreground bg-background border border-border rounded-md p-2 whitespace-pre-wrap">
                {artist?.bio || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Followers</Label>
              <p className="mt-1 text-foreground bg-background border border-border rounded-md p-2">
                {artist?.followers?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Genres</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {artist?.genres?.length > 0 ? (
                  artist.genres.map((genre, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 bg-blue-500/20 text-blue-400 border-blue-500/30"
                    >
                      {genre}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No genres available</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Songs by this artist</h2>
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
                      <TableRow key={song.id} className="hover:bg-muted/50 border-border transition-colors">
                        <TableCell className="flex items-center gap-2">
                          {song && song.coverArt ? (
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
                          <span>{song?.title || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          {song?.duration
                            ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            {song?.genre || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No songs available</p>
              )}
            </div>
            <hr className="border-t-2 border-gray-300 my-6" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Albums by this artist</h2>
              {albums.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Title</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Genre</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {albums.map((album) => (
                      <TableRow key={album.id} className="hover:bg-muted/50 border-border transition-colors">
                        <TableCell className="flex items-center gap-2">
                          {album && album.cover_art ? (
                            <img
                              src={album.cover_art}
                              alt={album.title}
                              className="w-12 h-12 object-cover rounded border border-border shadow"
                              onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-foreground/50">
                              No Image
                            </div>
                          )}
                          <span>{album?.title || "N/A"}</span>
                        </TableCell>
                        <TableCell>{album?.release_year || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            {album?.genres?.join(", ") || "N/A"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No albums available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-6">
            <div>
              <Label className="text-sm font-medium text-foreground">Profile Image URL</Label>
              <p className="mt-1 text-foreground bg-background border border-border rounded-md p-2 break-all">
                {artist?.image || 'N/A'}
              </p>
              {artist?.image && (
                <div className="mt-2">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="max-w-xs rounded-md border border-border"
                    onError={(e) => (e.target.src = '/placeholder.png')}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}