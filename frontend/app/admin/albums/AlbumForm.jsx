import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Plus, Search } from "lucide-react";
import { FaImage } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { fetchAlbumById, createAlbum, updateAlbum } from "./albumsApi";
import { fetchSongsByIds, fetchSongs } from "@/lib/api/songs";
import { fetchArtists } from "@/lib/api/artists";
import { uploadMedia } from "../songs/songApi";
import { Badge } from "@/components/ui/badge";

export default function AlbumForm({ album, onSubmit, onCancel, onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState(album?.cover_art || null);
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchSong, setSearchSong] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(album?.artist_id || "");
  const [genres, setGenres] = useState(album?.genres || []);
  const [newGenre, setNewGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 5;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      title: album?.title || "",
      artist_id: album?.artist_id || "",
      release_year: album?.release_year || 0,
      genres: album?.genres || [],
      cover_art: album?.cover_art || "",
      songs: album?.songs || [],
    },
  });

  useEffect(() => {
  if (album) {
    setSelectedArtist(album.artist_id);
    setValue("artist_id", album.artist_id);
  }
}, [album, setValue]);


useEffect(() => {
  const draft = localStorage.getItem("albumFormDraft");
  if (draft) {
    try {
      const parsedDraft = JSON.parse(draft);
      reset(parsedDraft);
      setSelectedSongs(parsedDraft.songs || []);
      setGenres(parsedDraft.genres || []);
      setPreview(parsedDraft.cover_art || null);
      setSelectedArtist(parsedDraft.artist_id || "");

      localStorage.setItem("albumFormDraft", JSON.stringify(parsedDraft));

      // 👇 thêm đoạn fetch để hiện danh sách Selected Songs
      if (parsedDraft.songs && parsedDraft.songs.length > 0) {
        fetchSongsByIds(parsedDraft.songs)
          .then((songsData) => {
            setSongs(songsData);
          })
          .catch((err) => {
            console.error("Fetch songs from draft failed", err);
          });
      }
    } catch (err) {
      console.error("Failed to parse draft", err);
    }
  }
}, [reset]);

// Lưu vào localStorage ngay khi form thay đổi
useEffect(() => {
  const subscription = watch((value) => {
    localStorage.setItem("albumFormDraft", JSON.stringify(value));
  });
  return () => subscription.unsubscribe();
}, [watch]);

  useEffect(() => {
    if (album) {
      reset({
        title: album.title || "",
        artist_id: album.artist_id || "",
        release_year: album.release_year || 0,
        genres: album.genres || [],
        cover_art: album.cover_art || "",
        songs: album.songs || [],
      });
      setPreview(album.cover_art || null);
      setSelectedArtist(album.artist_id || "");
      setSelectedSongs(album.songs || []);
      setGenres(album.genres || []);
      if (album.songs && album.songs.length > 0) {
        fetchSongsByIds(album.songs)
          .then((songsData) => {
            console.log("Songs response:", songsData);
            setSongs(songsData);
          })
          .catch((err) => {
            console.error("Fetch songs error:", err);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load album songs",
            });
          });
      }
    }

    fetchArtists()
      .then((artistsData) => {
        console.log("Artists response:", artistsData);
        setArtists(Array.isArray(artistsData) ? artistsData : artistsData?.artists || []);
      })
      .catch((err) => {
        console.error("Fetch artists error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load artists",
        });
        setArtists([]);
      });

    fetchSongs()
      .then((songsData) => {
        console.log("All songs response:", songsData);
        setAllSongs(Array.isArray(songsData) ? songsData : songsData?.songs || []);
      })
      .catch((err) => {
        console.error("Fetch all songs error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load songs",
        });
        setAllSongs([]);
      });
  }, [album, reset, toast]);

  const imageValue = watch("cover_art");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("cover_art", file);
        const result = await uploadMedia(formData);
        setValue("cover_art", result.coverArt || result.image);
        setPreview(URL.createObjectURL(file));
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Could not upload album image.",
        });
      }
    },
  });

  const handleAddSong = (songId) => {
    if (!selectedSongs.includes(songId)) {
      const newSelectedSongs = [...selectedSongs, songId];
      setSelectedSongs(newSelectedSongs);
      setValue("songs", newSelectedSongs);
      const song = allSongs.find((s) => s.id === songId);
      if (song) setSongs([...songs, song]);
    }
  };

  const handleRemoveSong = (songId) => {
    const newSelectedSongs = selectedSongs.filter((id) => id !== songId);
    setSelectedSongs(newSelectedSongs);
    setValue("songs", newSelectedSongs);
    setSongs(songs.filter((song) => song.id !== songId));
  };

  const addGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim())) {
      const updatedGenres = [...genres, newGenre.trim()];
      setGenres(updatedGenres);
      setValue("genres", updatedGenres);
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove) => {
    const updatedGenres = genres.filter((g) => g !== genreToRemove);
    setGenres(updatedGenres);
    setValue("genres", updatedGenres);
  };

  const filteredSongs = allSongs.filter((song) =>
    song.title?.toLowerCase().includes(searchSong.toLowerCase())
  );

  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);

  const onFormSubmit = async (data) => {
    if (user?.role !== "admin" || isSubmitting) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: user?.role !== "admin" ? "Only admins can submit album data" : "Submitting in progress",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Chuẩn hóa title
      data.title = data.title.trim().replace(/\s+/g, ' ');
      console.log("Submitting title:", data.title);
      data.genres = data.genres || [];
      if (data.genres.length === 0) {
        throw new Error("At least one genre is required");
      }
      console.log("Form data submitted:", data);
    if (album) {
    await updateAlbum(album.id, data);
    toast({ title: "Success", description: "Album updated successfully" });
    localStorage.removeItem("albumFormDraft");
      reset({ title: "",artist_id: "", release_year: 0, genres: [], cover_art: "",songs: [],
  });setPreview(null); setSelectedSongs([]); setGenres([]); setSelectedArtist("");
    onSubmit(data, { type: "success", message: "Album updated successfully!" });
    } else {
    await createAlbum(data);
    toast({ title: "Success", description: "Album created successfully" });
    localStorage.removeItem("albumFormDraft");
      reset({ title: "",artist_id: "", release_year: 0, genres: [], cover_art: "",songs: [],
  });setPreview(null); setSelectedSongs([]); setGenres([]); setSelectedArtist("");
    onSubmit(data, { type: "success", message: "Album created successfully!" });
    }

    } catch (err) {
      console.error("Submit error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to submit album",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md border-2 border-green-500/20 shadow-lg rounded-xl">
      <CardHeader className="border-b border-green-500/20 p-6">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          {album ? "Edit Album" : "Add New Album"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 rounded-lg p-1">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-400 transition-all duration-200 rounded-md px-4 py-2 text-sm font-medium"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="songs"
                className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-400 transition-all duration-200 rounded-md px-4 py-2 text-sm font-medium"
              >
                Songs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-5 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-300">Album Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter album title"
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                  />
                  {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="artist_id" className="text-sm font-medium text-gray-300">Artist</Label>
              <select
              id="artist_id"
              {...register("artist_id", { required: "Artist is required" })}
              value={selectedArtist}
              onChange={(e) => {
               setSelectedArtist(e.target.value);
               setValue("artist_id", e.target.value);
               }}
              className="mt-1 w-full bg-gray-800 border-gray-700 rounded-md p-2 text-foreground focus:ring-green-500 focus:border-green-500"
               >
              <option value="">Select an artist</option>
              {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
             ))}
             </select>

                  {errors.artist_id && <p className="text-sm text-red-400 mt-1">{errors.artist_id.message}</p>}
                </div>
                <div>
                  <Label htmlFor="release_year" className="text-sm font-medium text-gray-300">Release Year</Label>
                  <Input
                    id="release_year"
                    type="number"
                    {...register("release_year", {
                      required: "Release year is required",
                      min: { value: 1900, message: "Year must be after 1900" },
                      max: { value: new Date().getFullYear(), message: "Year cannot be in the future" },
                    })}
                    placeholder="Enter release year"
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                  />
                  {errors.release_year && <p className="text-sm text-red-400 mt-1">{errors.release_year.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">Genres</Label>
                  <div className="flex gap-2 mb-2 mt-1">
                    <Input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="Add a genre (e.g., Pop, R&B)"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                      className="text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                    />
                    <Button
                      type="button"
                      onClick={addGenre}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {genre}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-400"
                          onClick={() => removeGenre(genre)}
                        />
                      </Badge>
                    ))}
                  </div>
                  {errors.genres && <p className="text-sm text-red-400 mt-1">{errors.genres.message}</p>}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300 flex items-center">
                  <FaImage className="mr-2 text-green-400" /> Cover Art
                </Label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-green-500 p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-400 text-xs text-center">Drag & drop or click to upload</p>
                </div>
                <div className="mt-3">
                  <Label htmlFor="cover_art" className="text-sm text-gray-300">Or paste image URL</Label>
                  <Input
                    id="cover_art"
                    placeholder="https://..."
                    {...register("cover_art")}
                    onChange={(e) => {
                      const url = e.target.value;
                      setValue("cover_art", url);
                      setPreview(url);
                    }}
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md p-2"
                  />
                  {/* Nút mở folder coverArt */}
                  <button
                  type="button"
                  onClick={() =>
                  window.open(
                  "https://console.cloudinary.com/app/c-b0dc706a40de477a78984f32205e70/assets/media_library/folders/home?view_mode=mosaic",
                  "_blank"
                   )
                  }
                  className="mt-2 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                  >
                 🖼️ Browse Cloudinary CoverArt Folder
                </button>                  
                </div>
                {(preview || imageValue) && (
                  <div className="relative mt-3 w-fit">
                    <img
                      src={preview || imageValue}
                      alt="Cover Art Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-700 shadow-md"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("cover_art", "");
                        setPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-all duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="songs" className="space-y-6 mt-6">
              <div>
                <Label className="text-sm font-medium text-gray-300">Search Songs</Label>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search songs..."
                    value={searchSong}
                    onChange={(e) => {
                      setSearchSong(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 text-gray-300 bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Available Songs</Label>
                <Card className="bg-gray-800/50 border-gray-700 rounded-lg shadow-md">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-900/50">
                      <TableRow className="border-b border-gray-700">
                        <TableHead className="text-gray-300 py-2 px-4">Cover Art</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Title</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Duration</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Genre</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSongs.length > 0 ? (
                        paginatedSongs.map((song) => (
                          <TableRow
                            key={song.id}
                            className="hover:bg-gray-700/50 transition-all duration-200 border-b border-gray-700"
                          >
                            <TableCell className="py-2 px-4">
                              {song.coverArt ? (
                                <img
                                  src={song.coverArt}
                                  alt={song.title}
                                  className="w-12 h-12 object-cover rounded-md border border-gray-600 shadow-sm"
                                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">
                                  No Image
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-4 text-gray-300">{song.title || "N/A"}</TableCell>
                            <TableCell className="py-2 px-4 text-gray-300">
                              {song.duration
                                ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                                    .toString()
                                    .padStart(2, "0")}`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="py-2 px-4 text-gray-300">{song.genre || "N/A"}</TableCell>
                            <TableCell className="py-2 px-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddSong(song.id)}
                                disabled={selectedSongs.includes(song.id)}
                                className="text-green-400 hover:text-green-300 transition-all duration-200"
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-4">
                            No songs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-4 p-3 bg-gray-800/50 rounded-b-lg">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-all duration-200"
                      >
                        Previous
                      </Button>
                      <span className="flex items-center text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-all duration-200"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">Selected Songs</Label>
                <Card className="bg-gray-800/50 border-gray-700 rounded-lg shadow-md">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-900/50">
                      <TableRow className="border-b border-gray-700">
                        <TableHead className="text-gray-300 py-2 px-4">Cover Art</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Title</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Duration</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Genre</TableHead>
                        <TableHead className="text-gray-300 py-2 px-4">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {songs.length > 0 ? (
                        songs.map((song) => (
                          <TableRow
                            key={song.id}
                            className="hover:bg-gray-700/50 transition-all duration-200 border-b border-gray-700"
                          >
                            <TableCell className="py-2 px-4">
                              {song.coverArt ? (
                                <img
                                  src={song.coverArt}
                                  alt={song.title}
                                  className="w-12 h-12 object-cover rounded-md border border-gray-600 shadow-sm"
                                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">
                                  No Image
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-4 text-gray-300">{song.title || "N/A"}</TableCell>
                            <TableCell className="py-2 px-4 text-gray-300">
                              {song.duration
                                ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                                    .toString()
                                    .padStart(2, "0")}`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="py-2 px-4 text-gray-300">{song.genre || "N/A"}</TableCell>
                            <TableCell className="py-2 px-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSong(song.id)}
                                className="text-red-400 hover:text-red-300 transition-all duration-200"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-4">
                            No songs selected
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-6 border-t border-green-500/20">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-2 rounded-md shadow-md transition-all duration-200"
              disabled={user?.role !== "admin" || isSubmitting}
            >
              {album ? "Update Album" : "Create Album"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}