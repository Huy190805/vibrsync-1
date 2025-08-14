"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, User, Phone, Music2, Info } from "lucide-react";
import Image from "next/image";

export default function EditArtistProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    image: "",
    genres: [],
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "artist") {
      router.push("/signin");
      return;
    }

    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/artist/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          image: data.image || "",
          genres: data.genres || [],
          phone: data.phone || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, router]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/api/artist/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Update failed");

    setSuccess("🎉 Profile updated successfully!");

    // Optional: reset success message after a delay
    setTimeout(() => {
      setSuccess("");
    }, 3000);
    
  } catch (err) {
    setError(err.message);
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        image: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-white">
        Loading...
      </div>
    );

  return (
    <div className="relative bg-gray-950 text-white rounded-xl shadow-lg overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={formData.image || "/cover-placeholder.jpg"}
          alt="Background"
          fill
          className="object-cover opacity-20 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-black" />
      </div>

      {/* Title */}
      <div className="relative z-10 px-8 pt-6 pb-2">
        <h1 className="text-4xl font-bold text-white">Edit Artist Profile</h1>
        <p className="text-sm text-gray-400">
          Update your personal and music profile information.
        </p>                      
      </div>
    <button
    onClick={() => router.push("/role_artist/dashboard")}
    className="flex items-center gap-2 text-sm text-white hover:underline opacity-70 hover:opacity-100 transition"
    >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Back
    </button>        

<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
  {/* LEFT: Avatar + Upload */}
  <div className="flex flex-col items-center gap-4">
    {/* Avatar preview */}
    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-md">
      <Image
        src={formData.image || "/placeholder.svg?query=artist"}
        alt="Artist Avatar"
        fill
        className="object-cover"
      />
    </div>

    {/* Label */}
    <p className="text-lg font-semibold opacity-80 text-center">
      Artist Avatar Preview
    </p>

    {/* Upload button */}
    <div className="text-center">
      <Button
        type="button"
        variant="outline"
        className="text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} className="mr-2" />
        Change Avatar
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
    </div>

        {/* RIGHT: Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-70 flex items-center gap-1">
              <User size={16} /> Artist Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="bg-white/10 text-white border border-white/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-70 flex items-center gap-1">
              <Info size={16} /> Biography
            </label>
            <Textarea
              rows={4}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full p-3 rounded-md bg-[#412a66] text-gray-100 resize-none border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 scroll-container"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-70 flex items-center gap-1">
              <Phone size={16} /> Phone Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-white/10 text-white border border-white/20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-70 flex items-center gap-1">
              <Music2 size={16} /> Genres (comma separated)
            </label>
            <Input
              value={formData.genres.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  genres: e.target.value.split(",").map((g) => g.trim()),
                })
              }
              className="bg-white/10 text-white border border-white/20"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 transition text-white"
          >
            💾 Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
