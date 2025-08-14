"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SongView({ song, onClose }) {
  const [albums, setAlbums] = useState([]);
  const [albumTitle, setAlbumTitle] = useState("N/A");

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/artist/albums", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("❌ Failed to fetch albums:", res.status);
          return;
        }

        const data = await res.json();
        setAlbums(data.albums || []);

        // Tìm album chứa bài hát này
        const matchingAlbum = data.albums?.find((album) =>
          album.songs?.includes(song.id)
        );

        setAlbumTitle(matchingAlbum?.title || "N/A");
      } catch (err) {
        console.error("❌ Error loading album for song view:", err);
      }
    }

    if (song?.id) {
      fetchAlbums();
    }
  }, [song]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-green-500/20 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Song Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {song.coverArt && (
          <img
            src={song.coverArt}
            alt={song.title}
            className="w-32 h-32 object-cover rounded border border-gray-700 mx-auto"
          />
        )}
        <div>
          <strong>Title:</strong> {song.title || "Untitled"}
        </div>
        <div>
          <strong>Artist:</strong> {song.artistId || "N/A"}
        </div>
        <div>
          <strong>Album:</strong> {albumTitle}
        </div>
        <div>
          <strong>Release Year:</strong> {song.releaseYear || "N/A"}
        </div>
        <div>
          <strong>Duration:</strong>{" "}
          {song.duration
            ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}`
            : "N/A"}
        </div>
        <div>
          <strong>Genres:</strong> {song.genre?.join(", ") || "N/A"}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
