"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayIcon, Pause } from "lucide-react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";

const SongCard = memo(({ song, index, artistName, onPlay, isPlaying }) => {
  const router = useRouter();

  return (
    <motion.div
      key={song.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      className="relative w-full max-w-[180px] h-[220px] bg-gray-800/40 rounded-xl overflow-hidden"
    >
      {/* Ảnh bìa */}
      <div className="relative w-full h-[160px]">
        <Image
          src={song.image || "https://via.placeholder.com/180"}
          alt={song.title || "Bài hát không xác định"}
          width={180}
          height={160}
          className="w-full h-full object-cover cursor-pointer"
          loading="lazy"
          onClick={(e) => {
            e.stopPropagation();
            if (song.id) router.push(`/song/${song.id}`);
          }}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/180";
          }}
        />

        {/* Nút Play/Pause */}
        <motion.div
          className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
          whileHover={{ scale: 1.1, backgroundColor: "#5ac94bff" }}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <PlayIcon className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </div>

      {/* Thông tin bài hát */}
      <div className="p-2 text-white text-center">
        {song.id ? (
          <Link href={`/song/${song.id}`}>
            <span
              className="text-white hover:underline font-semibold truncate cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {song.title || "Bài hát không xác định"}
            </span>
          </Link>
        ) : (
          <span className="text-gray-400 font-semibold truncate">
            {song.title || "Bài hát không xác định"} (ID không hợp lệ)
          </span>
        )}
        <p className="text-xs text-gray-400 truncate">
          {song.artist || artistName}
        </p>
      </div>
    </motion.div>
  );
});

SongCard.propTypes = {
  song: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  artistName: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool,
};

export default SongCard;
