"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
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
import { fetchArtists, createSong, updateSong, uploadMedia, fetchAlbums, fetchArtistById } from "./songApi";
import axios from "axios";

export default function SongForm({ song, onSubmit, onCancel }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState({
    coverArt: song?.coverArt || null,
    audio: song?.audioUrl || null,
    artistImage: null,
  });
  const [genres, setGenres] = useState(song?.genre || []);
  const [newGenre, setNewGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      title: song?.title || "",
      artistId: song?.artistId || "",

      releaseYear: song?.releaseYear || 0,
      duration: song?.duration || 0,
      genre: song?.genre || [],
      coverArt: song?.coverArt || "",
      audioUrl: song?.audioUrl || "",
      lyrics_lrc: song?.lyrics_lrc || "",
      artistImage: "",
    },
  });

  const artistId = watch("artistId");
  const coverArtValue = watch("coverArt");
  const audioUrlValue = watch("audioUrl");
  const artistImageValue = watch("artistImage");
  const album = watch("album");

  const { data: artistsData, isLoading: isLoadingArtists, error: artistsError } = useQuery({
    queryKey: ["artists"],
    queryFn: fetchArtists,
    staleTime: 5 * 60 * 1000,
  });

  const { data: albumsData, isLoading: isLoadingAlbums, error: albumsError } = useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
    staleTime: 5 * 60 * 1000,
  });

  const artists = Array.isArray(artistsData) ? artistsData : artistsData?.artists || [];
  const albums = Array.isArray(albumsData) ? albumsData : albumsData?.albums || [];
  const albumOptions = useMemo(() => {
  return albums.map((album) => ({
    value: album.id,
    label: album.title,
  }));
  }, [albums]);


  useEffect(() => {
    console.log("SongForm albums:", albums);

    if (artistsError) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load artists" });
    }
    if (albumsError) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load albums" });
    }
  }, [artistsError, albumsError, toast, albums, song]);

  const { data: artistData, isLoading: isLoadingArtistImage } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: () => (artistId ? fetchArtistById(artistId) : Promise.resolve(null)),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (song) {
      console.log("SongForm reset with song:", song);
      reset({
        title: song.title || "",
        artistId: song.artistId || "",
        album: song.album || "",
        releaseYear: song.releaseYear || 0,
        duration: song.duration || 0,
        genre: song.genre || [],
        coverArt: song.coverArt || "",
        audioUrl: song.audioUrl || "",
        artistImage: "",
        lyrics_lrc: song.lyrics_lrc || "",
      });
      setPreview({
        coverArt: song.coverArt || null,
        audio: song.audioUrl || null,
        artistImage: null,
      });
      setGenres(song.genre || []);
    }
  }, [song, reset]);

  useEffect(() => {
    if (artistData?.image) {
      setValue("artistImage", artistData.image);
      setPreview((prev) => ({ ...prev, artistImage: artistData.image || null }));
    } else {
      setValue("artistImage", "");
      setPreview((prev) => ({ ...prev, artistImage: null }));
    }
  }, [artistData, setValue]);

// AUTO SAVE DRAFT (chỉ khi đang tạo mới bài hát)
useEffect(() => {
  if (!song) {
    const subscription = watch((value) => {
      localStorage.setItem(
        "songFormDraft",
        JSON.stringify({
          ...value,
          genre: genres,
          lyrics_lrc: value.lyrics_lrc || "",
        })
      );
    });
    return () => subscription.unsubscribe();
  }
}, [watch, genres, song]);

// RESTORE DRAFT (chỉ áp dụng nếu đang tạo mới)
useEffect(() => {
  if (!song) { // chỉ khi không có song thì mới load draft
    const draft = localStorage.getItem("songFormDraft");
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        reset(parsedDraft);
        setGenres(parsedDraft.genre || []);
        setPreview({
          coverArt: parsedDraft.coverArt || null,
          audio: parsedDraft.audioUrl || null,
          artistImage: parsedDraft.artistImage || null,
        });
      } catch (err) {
        console.error("Failed to parse song draft", err);
      }
    }
  }
}, [reset, song]);


  const { getRootProps: getCoverProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("cover_art", file);
        const result = await uploadMedia(formData);
        setValue("coverArt", result.coverArt);
        setPreview((prev) => ({ ...prev, coverArt: URL.createObjectURL(file) }));
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: " Failed to upload cover art" });
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
        setValue("audioUrl", result.audioUrl);
        setPreview((prev) => ({ ...prev, audio: URL.createObjectURL(file) }));
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to upload audio" });
      }
    },
  });

  const { getRootProps: getArtistImageProps, getInputProps: getArtistImageInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("image", file);
        const result = await uploadMedia(formData);
        const imageUrl = result.image || result.coverArt;
        setValue("artistImage", imageUrl);
        setPreview((prev) => ({ ...prev, artistImage: URL.createObjectURL(file) }));
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to upload artist image" });
      }
    },
  });

  const addGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim())) {
      const updatedGenres = [...genres, newGenre.trim()];
      setGenres(updatedGenres);
      setValue("genre", updatedGenres);
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove) => {
    const updatedGenres = genres.filter((g) => g !== genreToRemove);
    setGenres(updatedGenres);
    setValue("genre", updatedGenres);
  };

  const onFormSubmit = async (data) => {
    if (user?.role !== "admin" || isSubmitting) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: user?.role !== "admin" ? "Only admins can submit song data" : "Submitting in progress",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      data.title = data.title.trim().replace(/\s+/g, " ");
      data.genre = data.genre || [];
      
      console.log("Submitting song data:", data);
      if (data.genre.length === 0) {
        throw new Error("At least one genre is required");
      }
      if (song) {
        await updateSong(song.id, data);
        toast({ title: "Success", description: "Song updated successfully" });
        localStorage.removeItem("songFormDraft");
      reset({ title: "", artist: "", genre: [], url: "", image: "",
      }); setPreview(null);
        onSubmit(data, { type: "success", message: "Song updated successfully!" });
      } else {
        await createSong(data);
        console.log("createSong payload", data);
        toast({ title: "Success", description: "Song created successfully" });
        localStorage.removeItem("songFormDraft");
      reset({ title: "", artist: "", genre: [], url: "", image: "",
      }); setPreview(null);
        onSubmit(data, { type: "success", message: "Song created successfully!" });
      }
      if (data.artistImage && data.artistId) {
        await axios.put(
          `${API_URL}/admin/artists/${data.artistId}`,
          { image: data.artistImage },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to submit song",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md border-2 border-green-500/20 shadow-lg rounded-xl">
      <CardHeader className="border-b border-green-500/20 p-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          {song ? "Edit Song" : "Add New Song"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {(isLoadingArtists || isLoadingAlbums) && (
          <div className="text-center text-gray-400">Loading artists and albums...</div>
        )}
        {(artistsError || albumsError) && (
          <div className="text-center text-red-400">Error loading data, please try again</div>
        )}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-gray-300">Song Title</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Enter song title"
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                  {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="artistId" className="text-sm font-medium text-gray-300">Artist</Label>
                  <select
                    id="artistId"
                    {...register("artistId", { required: "Artist is required" })}
                    className="mt-1 w-full bg-gray-800 border-gray-700 rounded-md p-2 text-foreground focus:ring-green-500 focus:border-green-500"
                    defaultValue={song?.artistId || ""}
                    disabled={isLoadingArtists || artistsError}
                        onChange={(e) => {
                   const selectedId = e.target.value;
                   const selected = artists.find(a => a.id === selectedId);
                   setValue("artistId", selectedId);
                   setValue("artist", selected?.name || "Unknown Artist");  
                    }}
                  >
                    <option value="">Select an artist</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>{artist.name}</option>
                    ))}
                  </select>
                  <input type="hidden" {...register("artist")} />
                  {errors.artistId && <p className="text-sm text-red-400 mt-1">{errors.artistId.message}</p>}
                </div>
            <div className="col-span-2">
          <Label htmlFor="album" className="text-sm font-medium text-gray-300">
           Album
           </Label>
             <select
          id="album"
          {...register("album", { required: "Album is required" })}
          defaultValue={song?.album || ""}
           disabled={isLoadingAlbums || albumsError}
            className="mt-1 w-full bg-gray-800 border-gray-700 rounded-md p-2 text-foreground focus:ring-green-500 focus:border-green-500"
           >
           <option value="">Select an album</option>
          {albums.map((album) => (
          <option key={album.id} value={album.title}>
          {album.title}
          </option>
          ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Select one album for this song</p>
           {errors.album && (
          <p className="text-sm text-red-400 mt-1">{errors.album.message}</p>
             )}
            </div>  
                <div>
                  <Label htmlFor="releaseYear" className="text-sm font-medium text-gray-300">Release Year</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    {...register("releaseYear", {
                      required: "Release year is required",
                      min: { value: 1900, message: "Year must be after 1900" },
                      max: { value: new Date().getFullYear(), message: "Year cannot be in the future" },
                    })}
                    placeholder="Enter release year"
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                  {errors.releaseYear && <p className="text-sm text-red-400 mt-1">{errors.releaseYear.message}</p>}
                </div>
                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-300">Duration (sec)</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register("duration", { required: "Duration is required", min: { value: 1, message: "Duration must be positive" } })}
                    placeholder="Enter duration in seconds"
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                  {errors.duration && <p className="text-sm text-red-400 mt-1">{errors.duration.message}</p>}
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-300">Genres</Label>
                  <div className="flex gap-2 mb-2 mt-1">
                    <Input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="Add a genre (e.g., Pop, R&B)"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGenre())}
                      className="text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
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
              <label className="block mb-2 text-sm font-medium text-white">Lyrics (.LRC format)</label>
              <textarea
               {...register("lyrics_lrc")}
               rows={8}
                placeholder="[00:10.00]First line\n[00:20.00]Second line"
                className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 resize-none overflow-y-auto scroll-container pr-2"
               />
                  {genres.length === 0 && (
                    <p className="text-sm text-red-400 mt-1">At least one genre is required</p>
                  )}
                </div>
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
                  <Label htmlFor="coverArt" className="text-sm text-gray-300">Or paste image URL</Label>
                  <Input
                    id="coverArt"
                    placeholder="https://..."
                    {...register("coverArt")}
                    onChange={(e) => {
                      const url = e.target.value;
                      setValue("coverArt", url);
                      setPreview((prev) => ({ ...prev, coverArt: url }));
                    }}
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
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
                 🖼️ Browse Cloudinary CoverArt Song Folder
                </button>
                </div>
                {(preview.coverArt || coverArtValue) && (
                  <div className="relative mt-1 w-fit">
                    <img
                      src={preview.coverArt || coverArtValue}
                      alt="Cover Art Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-700 shadow-md"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("coverArt", "");
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
                  <Label htmlFor="audioUrl" className="text-sm text-gray-300">Or paste audio URL</Label>
                  <Input
                    id="audioUrl"
                    placeholder="https://..."
                    {...register("audioUrl")}
                    onChange={(e) => {
                      const url = e.target.value;
                      setValue("audioUrl", url);
                      setPreview((prev) => ({ ...prev, audio: url }));
                    }}
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                    {/* Nút mở thư mục Cloudinary */}
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
                {(preview.audio || audioUrlValue) && (
                  <div className="mt-1">
                    <audio
                      controls
                      src={preview.audio || audioUrlValue}
                      className="w-full bg-gray-800 rounded-lg p-0.5"
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("audioUrl", "");
                        setPreview((prev) => ({ ...prev, audio: null }));
                      }}
                      className="mt-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-all duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300 flex items-center">
                  <FaImage className="mr-1 text-green-400 h-4 w-4" /> Artist Profile Image
                </Label>
                {isLoadingArtistImage && (
                  <div className="text-center text-gray-400 text-sm">Loading artist image...</div>
                )}
                <div
                  {...getArtistImageProps()}
                  className="border-2 border-dashed border-green-500 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center h-16"
                >
                  <input {...getArtistImageInputProps()} />
                  <p className="text-gray-400 text-xs text-center">Drag & drop or click to upload artist image</p>
                </div>
                <div className="mt-1">
                  <Label htmlFor="artistImage" className="text-sm text-gray-300">Or paste artist image URL</Label>
                  <Input
                    id="artistImage"
                    placeholder="https://..."
                    {...register("artistImage")}
                    onChange={(e) => {
                      const url = e.target.value;
                      setValue("artistImage", url);
                      setPreview((prev) => ({ ...prev, artistImage: url }));
                    }}
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                  {/* Nút mở folder coverArt artist */}
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
                 🖼️ Browse Cloudinary CoverArt Artist Folder
                </button>                  
                </div>
                {(preview.artistImage || artistImageValue) && (
                  <div className="relative mt-1 w-fit">
                    <img
                      src={preview.artistImage || artistImageValue}
                      alt="Artist Image Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-700 shadow-md"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("artistImage", "");
                        setPreview((prev) => ({ ...prev, artistImage: null }));
                      }}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-all duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t border-green-500/20">
            <Button
              type="button"
              variant="outline"
          onClick={() => {
          
            onCancel();
          }}
          className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-md shadow-md transition-all duration-200"
              disabled={user?.role !== "admin" || isSubmitting || isLoadingArtists || isLoadingAlbums || artistsError || albumsError}
            >
              {song ? "Update Song" : "Create Song"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}