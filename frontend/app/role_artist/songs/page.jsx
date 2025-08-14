"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AnimatePresence } from "framer-motion";
import { fetchSongs, deleteSong } from "./ArtistsongApi";
import SongList from "./SongList";
import SongForm from "./SongForm";
import SongView from "./SongView";
import { motion } from "framer-motion";

const Alert = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center justify-between p-4 rounded-lg shadow-lg ${variants[type]} max-w-md w-full`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default function ArtistSongPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "artist") {
      router.push("/signin");
      return;
    }

    async function loadSongs() {
      try {
        const data = await fetchSongs();
        setSongs(Array.isArray(data) ? data : data.songs || []);
      } catch (err) {
        setAlert({ type: "error", message: err.message || "Failed to load songs" });
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) loadSongs();
  }, [user, authLoading, router]);

  const handleAdd = () => {
    setSelectedSong(null);
    setShowForm(true);
    setShowView(false);
  };

  const handleEdit = (song) => {
    setSelectedSong(song);
    setShowForm(true);
    setShowView(false);
  };

  const handleView = (song) => {
    setSelectedSong(song);
    setShowView(true);
    setShowForm(false);
  };

  const handleDelete = async (id, title) => {
    const confirmed = confirm(`Are you sure you want to delete ${title}?`);
    if (!confirmed) return;

    try {
      await deleteSong(id);
      const data = await fetchSongs();
      setSongs(Array.isArray(data) ? data : data.songs || []);
      setAlert({
        type: "success",
        message: `${title} deleted successfully!`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to delete song",
      });
    }
  };

  const handleFormSubmit = async (data, result) => {
    setShowForm(false);
    setSelectedSong(null);
    try {
      const data = await fetchSongs();
      setSongs(Array.isArray(data) ? data : data.songs || []);
      setAlert(result);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to refresh songs",
      });
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-10 text-white">Loading...</div>;
  }

return (
  <div className="space-y-6 relative px-6 py-8 bg-gray-900 text-white rounded-lg">
    <AnimatePresence>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </AnimatePresence>
    {showForm ? (
      <SongForm
        song={selectedSong}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setSelectedSong(null);
        }}
      />
    ) : showView ? (
      <SongView
        song={selectedSong}
        onClose={() => {
          setShowView(false);
          setSelectedSong(null);
        }}
      />
    ) : (
      <SongList
        songs={songs}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    )}
  </div>
);
}