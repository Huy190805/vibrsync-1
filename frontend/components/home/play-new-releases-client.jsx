"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useMusic } from "@/context/music-context";

export default function PlayNewReleasesClient({ songs }) {
  const { setSongs, setContext, setContextId, playSong } = useMusic();
  const [isActive, setIsActive] = useState(false);

  const handlePlayAll = () => {
    if (!songs || songs.length === 0) return;
    setSongs(songs);
    setContext("new-releases");
    setContextId(null);
    playSong(songs[0]);
    setIsActive(true);
  };

  return (
    <button
      onClick={handlePlayAll}
      title="Play All"
      className={`p-2 rounded-full transition ${
        isActive ? "bg-purple-600 text-white" : "bg-gray-800 text-white hover:bg-purple-400"
      }`}
    >
      <Play size={20} />
    </button>
  );
}
