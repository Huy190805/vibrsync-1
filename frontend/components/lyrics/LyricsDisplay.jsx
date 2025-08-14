"use client";
import { useEffect, useRef, useState } from "react";
import { useMusic } from "@/context/music-context";
import { fetchLyricsBySongId } from "@/lib/api/songs";

export default function LyricsDisplay({ songId }) {
  const { isPlaying, currentSong, audioRef } = useMusic();
  const [lyrics, setLyrics] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lineRefs = useRef([]);
  const rafRef = useRef(null);

  // Parse LRC
  function parseLRC(lrc) {
    const lines = lrc.split("\n").filter(Boolean);
    const timeRegex = /\[(\d{2}):(\d{2}\.\d{2})]/;
    return lines
      .map(line => {
        const match = line.match(timeRegex);
        if (!match) return null;
        const [_, min, sec] = match;
        const time = parseInt(min) * 60 + parseFloat(sec);
        const text = line.replace(timeRegex, "").trim();
        return { time, text };
      })
      .filter(Boolean);
  }

  // Load lyrics
  useEffect(() => {
    async function loadLyrics() {
      try {
        const res = await fetchLyricsBySongId(songId);
        const parsed = parseLRC(res.lyrics_lrc || "");
        setLyrics(parsed);
        setCurrentIndex(0);
      } catch (e) {
        setLyrics([{ time: 0, text: "Không có lời bài hát" }]);
      }
    }
    if (songId) loadLyrics();
  }, [songId]);

  // Sync lyric
  useEffect(() => {
    const sync = () => {
      if (!audioRef.current || lyrics.length === 0) return;
      const currentTime = audioRef.current.currentTime;

      const idx = lyrics.findIndex((line, i) => currentTime < line.time && i > 0);
      const newIndex = idx === -1 ? lyrics.length - 1 : idx - 1;

      setCurrentIndex(prev => (newIndex !== prev ? newIndex : prev));
      rafRef.current = requestAnimationFrame(sync);
    };

    if (isPlaying && currentSong?.id === songId) {
      rafRef.current = requestAnimationFrame(sync);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, currentSong?.id, songId, lyrics]);

  // Scroll dòng hiện tại lên giữa giao diện
  useEffect(() => {
    const currentLineEl = lineRefs.current[currentIndex];
    const container = document.querySelector("#lyrics-scroll");

    if (currentLineEl && container) {
      const offsetTop = currentLineEl.offsetTop;
      const containerHeight = container.clientHeight;
      const elementHeight = currentLineEl.clientHeight;

      const scrollTo = offsetTop - containerHeight / 2 + elementHeight / 2;
      container.scrollTo({ top: scrollTo, behavior: "smooth" });
    }
  }, [currentIndex]);

  return (
    <div
      id="lyrics-scroll"
      className="relative h-44 overflow-y-auto rounded-xl p-3 border border-purple-700/30 shadow-[0_0_12px_#a855f7] custom-scroll transition-all duration-300"
      style={{
        background: `linear-gradient(to bottom, #3b0a4d, #2e063b, #240632, #1d052a)`,
      }}
    >
      <div className="flex flex-col space-y-1">
        {lyrics.map((line, idx) => {
          const isCurrent = idx === currentIndex;
          const baseStyle =
            "text-center text-[15px] font-bold transition-all duration-300";
          const className =
            idx < currentIndex
              ? `${baseStyle} text-gray-500 opacity-30`
              : isCurrent
              ? `${baseStyle} text-yellow-400 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)] scale-105`
              : `${baseStyle} text-white/80`;

          return (
            <div
              key={idx}
              ref={el => (lineRefs.current[idx] = el)}
              className={className}
              style={{ height: "2.2rem", lineHeight: "2.2rem" }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
