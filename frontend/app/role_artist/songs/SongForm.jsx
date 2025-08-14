
"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { FaImage, FaMusic } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { fetchAlbums, createSong, updateSong, uploadMedia } from "./ArtistsongApi";

export default function SongForm({ song, onSubmit, onCancel }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    artistId: user?.id || "",
    albumId: "",
    releaseYear: "",
    duration: "",
    genre: [],
    coverArt: "",
    audioUrl: "",
    lyrics_lrc: "",
  });
  const [preview, setPreview] = useState({
    coverArt: song?.coverArt || null,
    audio: song?.audioUrl || null,
  });
  const [genres, setGenres] = useState(song?.genre || []);
  const [newGenre, setNewGenre] = useState("");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title || "",
        artistId: user?.id || "",
        albumId: song.albumId || "",
        releaseYear: song.releaseYear || "",
        duration: song.duration || "",
        genre: song.genre || [],
        coverArt: song.coverArt || "",
        audioUrl: song.audioUrl || "",
        lyrics_lrc: song.lyrics_lrc || "",
      });
      setGenres(song.genre || []);
      setPreview({
        coverArt: song.coverArt || null,
        audio: song.audioUrl || null,
      });
    }
  }, [song, user]);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const albumData = await fetchAlbums();
        setAlbums(Array.isArray(albumData) ? albumData : albumData?.albums || []);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load albums",
        });
        setAlbums([]);
      }
    }
    loadAlbums();
  }, [toast]);

  // Auto-save draft
  useEffect(() => {
    if (!song) {
      localStorage.setItem("songFormDraft", JSON.stringify({ ...formData, genre: genres }));
    }
  }, [formData, genres, song]);

  // Restore draft
  useEffect(() => {
    if (!song) {
      const draft = localStorage.getItem("songFormDraft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData(parsedDraft);
          setGenres(parsedDraft.genre || []);
          setPreview({
            coverArt: parsedDraft.coverArt || null,
            audio: parsedDraft.audioUrl || null,
          });
        } catch (err) {
          console.error("Failed to parse song draft", err);
        }
      }
    }
  }, [song]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "genre" ? value.split(",").map((g) => g.trim()) : value,
    }));
  };

  const { getRootProps: getCoverProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("cover_art", file);
        const result = await uploadMedia(formData);
        setFormData((prev) => ({ ...prev, coverArt: result.coverArt }));
        setPreview((prev) => ({ ...prev, coverArt: URL.createObjectURL(file) }));
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to upload cover art" });
      }
    },
  });

  const { getRootProps: getAudioProps, getInputProps: getAudioInputProps } = useDropzone({
    accept: { "audio/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("audio", file);
        const result = await uploadMedia(formData);
        setFormData((prev) => ({ ...prev, audioUrl: result.audioUrl }));
        setPreview((prev) => ({ ...prev, audio: URL.createObjectURL(file) }));
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to upload audio" });
      }
    },
  });

  const addGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim())) {
      const updatedGenres = [...genres, newGenre.trim()];
      setGenres(updatedGenres);
      setFormData((prev) => ({ ...prev, genre: updatedGenres }));
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove) => {
    const updatedGenres = genres.filter((g) => g !== genreToRemove);
    setGenres(updatedGenres);
    setFormData((prev) => ({ ...prev, genre: updatedGenres }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== "artist") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only artists can submit song data",
      });
      return;
    }
    if (formData.genre.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one genre is required",
      });
      return;
    }
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required",
      });
      return;
    }
    if (!formData.albumId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Album is required",
      });
      return;
    }
    if (!formData.releaseYear || formData.releaseYear < 1900 || formData.releaseYear > new Date().getFullYear()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Release year must be between 1900 and ${new Date().getFullYear()}`,
      });
      return;
    }
    if (!formData.duration || formData.duration <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Duration must be positive",
      });
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...formData,
        title: formData.title.trim().replace(/\s+/g, " "),
        releaseYear: parseInt(formData.releaseYear),
        duration: parseInt(formData.duration),
      };
      let result;
      if (song) {
        result = await updateSong(song.id, data);
      } else {
        result = await createSong(data);
      }
      localStorage.removeItem("songFormDraft");
      setFormData({
        title: "",
        artistId: user?.id || "",
        albumId: "",
        releaseYear: "",
        duration: "",
        genre: [],
        coverArt: "",
        audioUrl: "",
        lyrics_lrc: "",
      });
      setGenres([]);
      setPreview({ coverArt: null, audio: null });
      onSubmit(data, { type: "success", message: result.message || (song ? "Song updated successfully!" : "Song created successfully!") });
    } catch (err) {
      onSubmit(formData, { type: "error", message: err.message || "Failed to submit song" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          {song ? "Edit Song" : "Add New Song"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 rounded-lg p-1">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-400 transition-all duration-200 rounded-md px-3 py-1.5 text-sm font-medium"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-400 transition-all duration-200 rounded-md px-3 py-1.5 text-sm font-medium"
              >
                Media
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter song title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="albumId">Album</Label>
                <select
                  id="albumId"
                  name="albumId"
                  value={formData.albumId}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Album</option>
                  {albums.length > 0 ? (
                    albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No albums available</option>
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="releaseYear">Release Year</Label>
                <Input
                  id="releaseYear"
                  name="releaseYear"
                  type="number"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter release year"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter duration in seconds"
                />
              </div>
              <div>
                <Label>Genres</Label>
                <div className="flex gap-2 mb-2 mt-1">
                  <Input
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Add a genre (e.g., Pop, R&B)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                    className="bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500"
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
              </div>
              <div>
                <Label htmlFor="lyrics_lrc">Lyrics (.LRC format)</Label>
                <textarea
                  id="lyrics_lrc"
                  name="lyrics_lrc"
                  value={formData.lyrics_lrc}
                  onChange={handleChange}
                  rows={8}
                  placeholder="[00:10.00]First line\n[00:20.00]Second line"
                  className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-3 mt-3">
              <div>
                <Label className="text-sm font-medium text-gray-300 flex items-center">
                  <FaImage className="mr-1 text-green-400 h-4 w-4" /> Cover Art
                </Label>
                <div
                  {...getCoverProps()}
                  className="border-2 border-dashed border-green-500 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center h-16"
                >
                  <input {...getCoverInputProps()} />
                  <p className="text-gray-400 text-xs text-center">Drag & drop or click to upload cover art</p>
                </div>
                <div className="mt-1">
                  <Label htmlFor="coverArt">Or paste image URL</Label>
                  <Input
                    id="coverArt"
                    name="coverArt"
                    value={formData.coverArt}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://..."
                  />
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
                    🖼️ Browse Cloudinary CoverArt Song Folder
                  </button>
                </div>
                {preview.coverArt && (
                  <div className="relative mt-1 w-fit">
                    <img
                      src={preview.coverArt}
                      alt="Cover Art Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-700 shadow-md"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, coverArt: "" }));
                        setPreview((prev) => ({ ...prev, coverArt: null }));
                      }}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-all duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300 flex items-center">
                  <FaMusic className="mr-1 text-green-400 h-4 w-4" /> Audio
                </Label>
                <div
                  {...getAudioProps()}
                  className="border-2 border-dashed border-green-500 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center h-16"
                >
                  <input {...getAudioInputProps()} />
                  <p className="text-gray-400 text-xs text-center">Drag & drop or click to upload audio</p>
                </div>
                <div className="mt-1">
                  <Label htmlFor="audioUrl">Or paste audio URL</Label>
                  <Input
                    id="audioUrl"
                    name="audioUrl"
                    value={formData.audioUrl}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "https://console.cloudinary.com/app/c-b0dc706a40de477a78984f32205e70/assets/media_library/folders/cbc3107c94097f3a078b5e200e80ff1054?view_mode=mosaic",
                        "_blank"
                      )
                    }
                    className="mt-2 inline-flex items-center text-sm text-green-400 hover:text-green-300"
                  >
                    🎵 Browse Cloudinary Audio Folder
                  </button>
                </div>
                {preview.audio && (
                  <div className="mt-1">
                    <audio
                      controls
                      src={preview.audio}
                      className="w-full bg-gray-800 rounded-lg p-0.5"
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, audioUrl: "" }));
                        setPreview((prev) => ({ ...prev, audio: null }));
                      }}
                      className="mt-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-all duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || user?.role !== "artist"}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {loading ? "Saving..." : song ? "Update Song" : "Create Song"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
