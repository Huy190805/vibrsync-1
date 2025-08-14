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
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";
import { FaImage } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { fetchSongs, createPlaylist, updatePlaylist, uploadMedia } from "./playlistApi";

export default function PlaylistForm({ playlist, onSubmit, onCancel }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState({ thumbnail: playlist?.thumbnail || null });
  const [selectedSongs, setSelectedSongs] = useState(playlist?.songs || []);
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
      title: playlist?.title || "",
      description: playlist?.description || "",
      isPublic: playlist?.isPublic || false,
      isShuffle: playlist?.isShuffle || false,
      thumbnail: playlist?.thumbnail || "",
      songs: playlist?.songs || [],
    },
  });

  const thumbnailValue = watch("thumbnail");

  const { data: songsData, isLoading: isLoadingSongs, error: songsError } = useQuery({
    queryKey: ["songs"],
    queryFn: () => fetchSongs({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const songOptions = useMemo(() => {
    return (Array.isArray(songsData) ? songsData : songsData?.songs || []).map((song) => ({
      value: song.id,
      label: `${song.title} - ${song.artist}`,
    }));
  }, [songsData]);

  useEffect(() => {
    if (songsError) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load songs" });
    }
  }, [songsError, toast]);

  useEffect(() => {
    if (playlist) {
      reset({
        title: playlist.title || "",
        description: playlist.description || "",
        isPublic: playlist.isPublic || false,
        isShuffle: playlist.isShuffle || false,
        thumbnail: playlist.thumbnail || "",
        songs: playlist.songs || [],
      });
      setPreview({ thumbnail: playlist.thumbnail || null });
      setSelectedSongs(playlist.songs || []);
    }
  }, [playlist, reset]);

  // Auto-save draft
  useEffect(() => {
    if (!playlist) {
      const subscription = watch((value) => {
        localStorage.setItem(
          "playlistFormDraft",
          JSON.stringify({
            ...value,
            songs: selectedSongs,
          })
        );
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, selectedSongs, playlist]);

  // Restore draft
  useEffect(() => {
    if (!playlist) {
      const draft = localStorage.getItem("playlistFormDraft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          reset(parsedDraft);
          setSelectedSongs(parsedDraft.songs || []);
          setPreview({ thumbnail: parsedDraft.thumbnail || null });
        } catch (err) {
          console.error("Failed to parse playlist draft", err);
        }
      }
    }
  }, [reset, playlist]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append("thumbnail", file);
        const result = await uploadMedia(formData);
        setValue("thumbnail", result.thumbnail);
        setPreview({ thumbnail: URL.createObjectURL(file) });
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to upload thumbnail" });
      }
    },
  });

  const handleSongChange = (selectedOptions) => {
    const newSongs = selectedOptions ? selectedOptions.map((opt) => ({
      id: opt.value,
      title: opt.label.split(" - ")[0],
      artist: opt.label.split(" - ")[1],
    })) : [];
    setSelectedSongs(newSongs);
    setValue("songs", newSongs);
  };

  const onFormSubmit = async (data) => {
    if (user?.role !== "admin" || isSubmitting) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: user?.role !== "admin" ? "Only admins can submit playlist data" : "Submitting in progress",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      data.title = data.title.trim().replace(/\s+/g, " ");
      data.songs = selectedSongs;
      if (playlist) {
        await updatePlaylist(playlist.id, data);
        toast({ title: "Success", description: "Playlist updated successfully" });
        localStorage.removeItem("playlistFormDraft");
        onSubmit(data, { type: "success", message: "Playlist updated successfully!" });
      } else {
        await createPlaylist(data);
        toast({ title: "Success", description: "Playlist created successfully" });
        localStorage.removeItem("playlistFormDraft");
        onSubmit(data, { type: "success", message: "Playlist created successfully!" });
      }
      reset({ title: "", description: "", isPublic: false, isShuffle: false, thumbnail: "", songs: [] });
      setPreview({ thumbnail: null });
      setSelectedSongs([]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to submit playlist",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md border-2 border-green-500/20 shadow-lg rounded-xl">
      <CardHeader className="border-b border-green-500/20 p-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          {playlist ? "Edit Playlist" : "Add New Playlist"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {isLoadingSongs && <div className="text-center text-gray-400">Loading songs...</div>}
        {songsError && <div className="text-center text-red-400">Error loading songs, please try again</div>}
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
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-300">Playlist Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter playlist title"
                  className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                />
                {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-300">Description</Label>
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="Enter playlist description"
                  className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isPublic" className="text-sm font-medium text-gray-300">Public</Label>
                  <Switch
                    id="isPublic"
                    {...register("isPublic")}
                    onCheckedChange={(checked) => setValue("isPublic", checked)}
                    checked={watch("isPublic")}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="isShuffle" className="text-sm font-medium text-gray-300">Shuffle</Label>
                  <Switch
                    id="isShuffle"
                    {...register("isShuffle")}
                    onCheckedChange={(checked) => setValue("isShuffle", checked)}
                    checked={watch("isShuffle")}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="songs" className="text-sm font-medium text-gray-300">Songs</Label>
                <Select
                  isMulti
                  options={songOptions}
                  value={songOptions.filter((opt) => selectedSongs.some((song) => song.id === opt.value))}
                  onChange={handleSongChange}
                  placeholder="Select songs..."
                  className="mt-1 text-foreground"
                  classNamePrefix="react-select"
                  isDisabled={isLoadingSongs || songsError}
                />
                {selectedSongs.length === 0 && (
                  <p className="text-sm text-red-400 mt-1">At least one song is required</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-3 mt-3">
              <div>
                <Label className="text-sm font-medium text-gray-300 flex items-center">
                  <FaImage className="mr-1 text-green-400 h-4 w-4" /> Thumbnail
                </Label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-green-500 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 flex items-center justify-center h-16"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-400 text-xs text-center">Drag & drop or click to upload thumbnail</p>
                </div>
                <div className="mt-1">
                  <Label htmlFor="thumbnail" className="text-sm text-gray-300">Or paste thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    placeholder="https://..."
                    {...register("thumbnail")}
                    onChange={(e) => {
                      const url = e.target.value;
                      setValue("thumbnail", url);
                      setPreview({ thumbnail: url });
                    }}
                    className="mt-1 text-foreground bg-gray-800 border-gray-700 focus:ring-green-500 focus:border-green-500 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => window.open("https://console.cloudinary.com/app/c-b0dc706a40de477a78984f32205e70/assets/media_library/folders/home?view_mode=mosaic", "_blank")}
                    className="mt-2 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    🖼️ Browse Cloudinary Thumbnail Folder
                  </button>
                </div>
                {(preview.thumbnail || thumbnailValue) && (
                  <div className="relative mt-1 w-fit">
                    <img
                      src={preview.thumbnail || thumbnailValue}
                      alt="Thumbnail Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-700 shadow-md"
                      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("thumbnail", "");
                        setPreview({ thumbnail: null });
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
              onClick={onCancel}
              className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-md shadow-md transition-all duration-200"
              disabled={user?.role !== "admin" || isSubmitting || isLoadingSongs || songsError}
            >
              {playlist ? "Update Playlist" : "Create Playlist"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}