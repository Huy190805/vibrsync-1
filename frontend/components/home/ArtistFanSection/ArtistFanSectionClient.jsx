"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import ArtistHeader from "./ArtistHeader";
import SongList from "./SongList";
import { useMusic } from "@/context/music-context";
import { fetchSongsByArtistWithQuery } from "@/lib/api/songs";

// Format duration
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// Framer motion animation
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Fetch and map songs for artist
const fetchSongsForArtist = async (artist) => {
  const songsData = await fetchSongsByArtistWithQuery(artist.id, {
    cache: "force-cache",
    fields: "_id,title,artist,coverArt,duration,artistId",
  });

  return songsData
    .slice(0, 200)
    .filter((song) => {
      const hasValidId = song._id || song.id;
      const matchesArtistById = String(song.artistId) === String(artist.id);
      const matchesArtistByName = song.artist === artist.name;
      return hasValidId && (matchesArtistById || matchesArtistByName);
    })
    .map((song) => ({
      id: song._id || song.id || crypto.randomUUID(),
      title: song.title || "Bài hát không xác định",
      duration: song.duration ? formatDuration(song.duration) : "3:00",
      image: song.thumbnail || song.coverArt || song.image || "https://via.placeholder.com/180",
      audioUrl: song.audioUrl || "",
      coverArt: song.coverArt || "",
      artist_id: song.artistId || artist.id,
      artist: song.artist || artist.name,
    }));
};

export default function ArtistFanSectionClient({ initialArtists, initialArtistIndex, initialSongs }) {
  const [artists, setArtists] = useState(initialArtists || []);
  const [currentArtistIndex, setCurrentArtistIndex] = useState(initialArtistIndex || 0);
  const [topSongs, setTopSongs] = useState(initialSongs || []);
  const [songPageIndex, setSongPageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const songsPerPage = 5;

  const currentArtist = artists[currentArtistIndex] || {};

  const {
    setSongs,
    setContext,
    setContextId,
    playSong,
    togglePlayPause,
    isPlaying,
    currentSong,
  } = useMusic();

  // Fetch songs when artist index changes
  useEffect(() => {
    if (!currentArtist?.id) return;
    const fetch = async () => {
      setIsLoading(true);
      const newSongs = await fetchSongsForArtist(currentArtist);
      setTopSongs(newSongs);
      setIsLoading(false);
    };
    fetch();
  }, [currentArtistIndex]);

  // Timer for artist switching
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextArtist();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentArtistIndex, artists]);

  // Play a song
  const handlePlay = useCallback(
    (song) => {
      if (currentSong && currentSong.id === song.id && isPlaying) {
        togglePlayPause();
      } else {
        setSongs(topSongs);
        setContext("artist");
        setContextId(song.artist_id);
        playSong({
          ...song,
          image: song.image || "https://via.placeholder.com/180",
        });
      }
    },
    [topSongs, currentSong, isPlaying]
  );

  // Play all (first song)
  const handlePlayAll = useCallback(() => {
    if (topSongs.length === 0) return;
    const firstSong = topSongs[0];
    setSongs(topSongs);
    setContext("artist");
    setContextId(firstSong.artist_id);
    playSong({
      ...firstSong,
      image: firstSong.image || "https://via.placeholder.com/180",
    });
  }, [topSongs]);

  // Next artist
  const handleNextArtist = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * artists.length);
    } while (newIndex === currentArtistIndex && artists.length > 1);

    setSongPageIndex(0);
    setCurrentArtistIndex(newIndex);
  }, [artists, currentArtistIndex]);

  // Paging
  const handlePrevPage = useCallback(() => {
    setSongPageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleNextPage = useCallback(() => {
    setSongPageIndex((prev) => Math.min(prev + 1, Math.ceil(topSongs.length / songsPerPage) - 1));
  }, [topSongs]);

  return (
  <Suspense fallback={null}>
    <AnimatePresence>
      {isLoading ? null : (
        <motion.div
          key={currentArtist.id}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <ArtistHeader
            artist={currentArtist}
            timeLeft={timeLeft}
            onNextArtist={handleNextArtist}
          />
          <SongList
            songs={topSongs}
            songPageIndex={songPageIndex}
            songsPerPage={songsPerPage}
            artistName={currentArtist.name || "Nghệ sĩ không xác định"}
            onPlay={handlePlay}
            isPlaying={isPlaying}
            currentSong={currentSong}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </Suspense>
  );
}

ArtistFanSectionClient.propTypes = {
  initialArtists: PropTypes.array.isRequired,
  initialArtistIndex: PropTypes.number.isRequired,
  initialSongs: PropTypes.array.isRequired,
};
