"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import AlbumList from "./AlbumList";
import AlbumForm from "./AlbumForm";
import AlbumView from "./AlbumView";
import { fetchAlbums, createAlbum, updateAlbum, deleteAlbum } from "./ArtistAlbumApi";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ArtistAlbums() {
  const { user, loading: authLoading } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role !== "artist") {
      router.push("/signin");
      return;
    }
    if (!localStorage.getItem("token")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No authentication token found",
      });
      router.push("/signin");
      return;
    }
    loadAlbums();
  }, [user, authLoading, router, toast]);

const loadAlbums = async () => {
  try {
    const data = await fetchAlbums();

    const albumArray = Array.isArray(data)
      ? data
      : Array.isArray(data.albums)
      ? data.albums
      : [];

    setAlbums(albumArray);

    console.log("Albums data:", albumArray);
  } catch (err) {
    setAlert({
      type: "error",
      message: err.message || "Failed to load albums",
    });
  }
};
const fetchSongsByAlbumId = async (albumId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/api/artist/albums/${albumId}/songs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch songs");
    const data = await res.json();
    return data;
  } catch (err) {
    return [];
  }
};


  const handleAdd = () => {
    setSelectedAlbum(null);
    setShowForm(true);
    setShowView(false);
  };

  const handleEdit = (album) => {
    setSelectedAlbum(album);
    setShowForm(true);
    setShowView(false);
  };

  const handleView = (album) => {
    setSelectedAlbum(album);
    setShowView(true);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this album?");
    if (!confirmed) return;

    try {
      const data = await deleteAlbum(id);
      await loadAlbums();
      setAlert({
        type: "success",
        message: data.message || "Album deleted successfully!",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "Failed to delete album",
      });
    }
  };

  const handleFormSubmit = async (_albumData, result) => {
    setShowForm(false);
    setSelectedAlbum(null);
    await loadAlbums();
    if (result) {
      setAlert(result);
    }
  };

  if (authLoading) {
    return <div className="text-center py-10 text-white">Loading albums...</div>;
  }

return (
  <div className="space-y-6 relative max-w-7xl mx-auto p-8 bg-gray-900 text-white rounded-lg">
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
      <AlbumForm
        album={selectedAlbum}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setSelectedAlbum(null);
        }}
      />
    ) : showView ? (
      <AlbumView
        album={selectedAlbum}
        onClose={() => {
          setShowView(false);
          setSelectedAlbum(null);
        }}
      />
    ) : (
      <AlbumList
        albums={albums}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        fetchSongsByAlbumId={fetchSongsByAlbumId}
      />
    )}
  </div>
);
}