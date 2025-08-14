import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { fetchSongs } from '@/lib/api/songs';
import { fetchAlbums } from '@/lib/api/albums';

export function ArtistList({ artists, onAdd, onEdit, onDelete, onView }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [artistSongMap, setArtistSongMap] = useState({});
  const [artistAlbumMap, setArtistAlbumMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadSongsAndAlbums() {
      setIsLoading(true);
      try {
        // Lấy danh sách bài hát
        const songsData = await fetchSongs();
        const songList = Array.isArray(songsData) ? songsData : songsData?.songs || [];
        console.log("Songs response:", JSON.stringify(songList, null, 2));

        // Tạo artistSongMap: artistId -> [songTitle]
        const songMap = {};
        songList.forEach((song) => {
          const artistIds = [
            song.artistId,
            ...(song.contributingArtistIds || []),
          ].filter((id) => id && typeof id === "string");
          
          artistIds.forEach((artistId) => {
            if (!songMap[artistId]) {
              songMap[artistId] = [];
            }
            songMap[artistId].push(song.title || "N/A");
          });
        });
        setArtistSongMap(songMap);
        console.log("Artist song map:", songMap);

        // Lấy danh sách album
        const albumsData = await fetchAlbums();
        const albumList = Array.isArray(albumsData) ? albumsData : albumsData?.albums || [];
        console.log("Albums response:", JSON.stringify(albumList, null, 2));

        // Tạo artistAlbumMap: artistId -> [albumTitle]
        const albumMap = {};
        albumList.forEach((album) => {
          const artistIds = [
            album.artist_id, // Thêm trực tiếp artist_id của album
            ...(album.contributingArtistIds || []), // Nếu có contributing artists
          ].filter((id) => id && typeof id === "string");

          artistIds.forEach((artistId) => {
            if (!albumMap[artistId]) {
              albumMap[artistId] = [];
            }
            if (!albumMap[artistId].includes(album.title)) {
              albumMap[artistId].push(album.title);
            }
          });

          // Thêm album dựa trên mối quan hệ với bài hát (bổ sung)
          const songIds = album.songs || [];
          const relatedSongIds = songIds.filter((songId) => {
            const song = songList.find((s) => s.id === songId);
            if (!song) return false;
            return (
              song.artistId === album.artist_id ||
              (song.contributingArtistIds || []).includes(album.artist_id)
            );
          });

          relatedSongIds.forEach((songId) => {
            const song = songList.find((s) => s.id === songId);
            if (!song) return;
            const songArtistIds = [
              song.artistId,
              ...(song.contributingArtistIds || []),
            ].filter((id) => id && typeof id === "string");

            songArtistIds.forEach((artistId) => {
              if (!albumMap[artistId]) {
                albumMap[artistId] = [];
              }
              if (!albumMap[artistId].includes(album.title)) {
                albumMap[artistId].push(album.title);
              }
            });
          });
        });
        setArtistAlbumMap(albumMap);
        console.log("Artist album map:", albumMap);
      } catch (err) {
        console.error("Load songs and albums error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load songs or albums",
        });
        setArtistSongMap({});
        setArtistAlbumMap({});
      } finally {
        setIsLoading(false);
      }
    }

    if (artists.length > 0) {
      loadSongsAndAlbums();
    }
  }, [artists, toast]);

  const filteredArtists = artists.filter((artist) =>
    [
      artist.name,
      ...(artist.genres || []),
      artist.bio || "",
      (artistSongMap[artist.id] || []).join(", "),
      (artistAlbumMap[artist.id] || []).join(", "),
    ].some((field) => typeof field === "string" && field.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredArtists.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredArtists, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArtists = filteredArtists.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Artists
          </h1>
          <p className="text-muted-foreground text-lg">Manage your music artists</p>
        </div>
        <Button
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25"
        >
          <Plus className="h-4 w-4" />
          Add Artist
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20">
        <CardHeader className="border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">All Artists ({filteredArtists.length})</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search artists, songs, or albums..."
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
              <TableRow className="border-border">
                <TableHead>Artist</TableHead>
                <TableHead>Songs</TableHead>
                <TableHead>Albums</TableHead>
                <TableHead>Genres</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArtists.map((artist) => {
                const songs = artistSongMap[artist.id] || ["N/A"];
                const displaySongs = songs.slice(0, 2);
                const remainSongs = songs.length - displaySongs.length;

                const albums = artistAlbumMap[artist.id] || ["N/A"];
                const displayAlbums = albums.slice(0, 2);
                const remainAlbums = albums.length - displayAlbums.length;

                return (
                  <TableRow key={artist.id} className="hover:bg-muted/50 border-border transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-green-500/30">
                          <AvatarImage src={artist.image} alt={artist.name} />
                          <AvatarFallback className="bg-green-500/20 text-green-400">
                            {artist.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{artist.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {artist.bio}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative group cursor-pointer">
                        {isLoading ? "Loading..." : displaySongs.join(", ")}
                        {remainSongs > 0 && !isLoading && ` +${remainSongs}`}
                        <div className="hidden group-hover:block absolute z-10 top-full left-0 bg-gray-800 text-white text-xs p-2 rounded shadow border mt-1 whitespace-nowrap">
                          {isLoading ? "Loading..." : songs.join(", ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative group cursor-pointer">
                        {isLoading ? "Loading..." : displayAlbums.join(", ")}
                        {remainAlbums > 0 && !isLoading && ` +${remainAlbums}`}
                        <div className="hidden group-hover:block absolute z-10 top-full left-0 bg-gray-800 text-white text-xs p-2 rounded shadow border mt-1 whitespace-nowrap">
                          {isLoading ? "Loading..." : albums.join(", ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(artist.genres || []).slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            {genre}
                          </Badge>
                        ))}
                        {artist.genres && artist.genres.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{artist.genres.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{artist.followers.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(artist.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView({ ...artist, songs: artistSongMap[artist.id] || [], albums: artistAlbumMap[artist.id] || [] })}
                          className="hover:bg-blue-500/20 hover:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(artist)}
                          className="hover:bg-green-500/20 hover:text-green-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(artist.id)}
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
              <span className="flex items-center px-4 text-sm text-gray-400">
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