"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPlaylists, deletePlaylist } from "./playlistApi";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import PlaylistTable from "./PlaylistTable";
import PlaylistForm from "./PlaylistForm";
import PlaylistView from "./PlaylistView";

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

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await fetchPlaylists();
      setPlaylists(Array.isArray(data) ? data : data.playlists || []);
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Failed to load playlists" });
    }
  };

  const handleAdd = () => {
    setSelectedPlaylist(null);
    setShowForm(true);
    setShowView(false);
  };

  const handleEdit = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowForm(true);
    setShowView(false);
  };

  const handleView = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowView(true);
    setShowForm(false);
  };

  const handleDelete = async (id, title) => {
    const confirmed = confirm(`Are you sure you want to delete playlist: ${title}?`);
    if (!confirmed) return;

    try {
      await deletePlaylist(id);
      await loadPlaylists();
      setAlert({
        type: "success",
        message: `Deleted playlist ${title} successfully!`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to delete playlist",
      });
    }
  };

  const handleFormSubmit = async (data, result) => {
    setShowForm(false);
    setSelectedPlaylist(null);
    await loadPlaylists();
    if (result) setAlert(result);
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </AnimatePresence>

      {showForm ? (
        <PlaylistForm
          playlist={selectedPlaylist}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedPlaylist(null);
          }}
        />
      ) : showView ? (
        <PlaylistView
          playlist={selectedPlaylist}
          onClose={() => {
            setShowView(false);
            setSelectedPlaylist(null);
          }}
        />
      ) : (
        <PlaylistTable
          playlists={playlists}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
    </div>
  );
}
