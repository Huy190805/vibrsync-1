"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import LyricsDisplay from "./LyricsDisplay";

export default function LyricsPopup({ song, onClose }) {
  if (!song) return null;

  const handleCopyLyrics = async () => {
    const lyricsText = song.lyrics_lrc || "No lyrics available.";
    try {
      await navigator.clipboard.writeText(lyricsText);
      alert("Lyrics copied to clipboard!");
    } catch (error) {
      alert("Failed to copy lyrics.");
    }
  };

  return (
    <div className="w-96 bg-[#2f1c47] text-white rounded-xl shadow-2xl p-6 border border-purple-700 max-h-[55vh] overflow-y-auto scroll-container pr-2">

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
      >
        ✕
      </button>

      {/* 🎵 Song Title - Artist */}
      <h2 className="text-lg font-semibold mb-4 text-white break-words">
        🎵 {song.title || "Untitled"}
        {song.artist ? ` - ${song.artist}` : ""}
      </h2>

      {/* Lyrics Content */}
      <div className="text-sm text-gray-300 leading-relaxed space-y-2 pr-1 mb-4 max-h-[35vh] overflow-y-auto">
        {song.lyrics_lrc ? (
          <LyricsDisplay lrc={song.lyrics_lrc} songId={song.id} />
        ) : (
          <p>No lyrics available.</p>
        )}
      </div>

      {/* Copy Lyrics Button (centered) */}
      {song.lyrics_lrc && (
    <div className="flex justify-center">
    <button
    onClick={handleCopyLyrics}
    className="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 transition"
    >
    Copy Lyrics
  </button>
   </div>
      )}
    </div>
  );
}
