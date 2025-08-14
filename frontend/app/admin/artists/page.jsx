"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchArtists } from "@/lib/api";
import { ArtistList } from "./ArtistList";
import { ArtistForm } from "./ArtistForm";
import { ArtistView } from "./ArtistView";
import { motion, AnimatePresence } from "framer-motion";

const Alert = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-dismiss after 5 seconds
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

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/admin/artists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setArtists(data?.artists || []);
    } catch (err) {
      console.error("Failed to load artists", err);
      setAlert({ type: "error", message: "Failed to load artists" });
    }
  };

  const handleAdd = () => {
    setSelectedArtist(null);
    setShowForm(true);
  };

  const handleEdit = (artist) => {
    setSelectedArtist(artist);
    setShowForm(true);
  };

  const handleView = (artist) => {
    setSelectedArtist(artist);
    setShowView(true);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this artist?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_API_URL}/admin/artists/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        loadArtists();
        setAlert({
          type: "success",
          message: data.message || "Artist deleted successfully!",
        });
      } else {
        console.error("Failed to delete artist:", data.detail || res.statusText);
        setAlert({
          type: "error",
          message: data.detail || "Failed to delete artist",
        });
      }
    } catch (err) {
      console.error("Delete error", err);
      setAlert({
        type: "error",
        message: "An error occurred while deleting",
      });
    }
  };

  const handleFormSubmit = async (artistData) => {
    const token = localStorage.getItem("token");
    const method = selectedArtist ? "PUT" : "POST";
    const url = selectedArtist
      ? `${BASE_API_URL}/admin/artists/${selectedArtist.id}`
      : `${BASE_API_URL}/admin/artists`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(artistData),
      });
      const data = await res.json();
      console.log("Response data:", data);
      if (res.status === 200 || res.status === 201 || res.status === 204) {
        setShowForm(false);
        setSelectedArtist(null);
        await loadArtists();
        const successMessage = data.message || (selectedArtist ? "Artist updated successfully!" : "Artist created successfully!");
        setAlert({
          type: "success",
          message: successMessage,
        });
      } else {
        console.error("Failed to save artist:", data.detail || res.statusText);
        setAlert({
          type: "error",
          message: data.detail || "Failed to save artist",
        });
      }
    } catch (err) {
      console.error("Save error", err);
      setAlert({
        type: "error",
        message: "An error occurred while saving",
      });
    }
  };

  const BASE_API_URL = "http://localhost:8000/api";

  return (
    <div className="space-y-6 relative">
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
        <ArtistForm
          artist={selectedArtist}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedArtist(null);
          }}
        />
      ) : showView ? (
        <ArtistView
          artist={selectedArtist}
          onClose={() => {
            setShowView(false);
            setSelectedArtist(null);
          }}
        />
      ) : (
        <ArtistList
          artists={artists}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
    </div>
  );
}