"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Music, UploadCloud, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/<your_cloud_name>/";
const CACHE_KEY = "userCache";

export default function ProfileAccountSetting() {
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const getCachedUser = useCallback(async () => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setNewName(parsed.name);
        return;
      }

      const res = await axios.get("http://localhost:8000/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser(res.data);
      setNewName(res.data.name);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/signin");
      } else {
        setError("Failed to fetch user data");
      }
    }
  }, [router]);

  useEffect(() => {
    getCachedUser();
  }, [getCachedUser]);

  const refreshUserData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data);
      setNewName(res.data.name);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
    } catch {
      setError("Failed to refresh user data");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split(".").pop();
    if (!["jpg", "jpeg"].includes(ext)) {
      setError("Only JPG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await refreshUserData();
      await refreshUser();
      setSuccess("Avatar updated!");
    } catch {
      setError("Failed to upload avatar");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        "http://localhost:8000/user/change-password",
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    } catch {
      setError("Incorrect old password or error occurred");
    }
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.patch(
        "http://localhost:8000/user/user/update-name",
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await refreshUser();
      await refreshUserData();
      setSuccess("Name updated successfully");
    } catch {
      setError("Failed to update name");
    }
  };

  if (!user) return <div className="text-white p-10">Loading profile...</div>;

  return (
    <div className="min-h-[80vh] bg-black text-white relative px-4 sm:px-8 py-10">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-gray-300 hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-4">
          <Music size={32} />
        </div>
        <h2 className="text-3xl font-bold">Your Profile</h2>
        <p className="text-gray-400 mt-2">Manage your info and security</p>
      </div>

      <div className="max-w-5xl mx-auto">
        {error && <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-white p-3 rounded-lg mb-4">{success}</div>}
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Avatar Section */}
        <div className="bg-white/5 p-6 h-96 rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center space-y-4 text-center">
          <img
            src={
              user.avatar?.startsWith("http")
                ? user.avatar
                : `${CLOUDINARY_BASE_URL}${user.avatar || "images/default.jpg"}`
            }
            alt="Avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.svg";
            }}
            className="w-40 h-40 rounded-full object-cover border-2 border-purple-500"
          />
          <label
            htmlFor="avatar"
            className="inline-flex items-center gap-2 cursor-pointer bg-purple-700 hover:bg-purple-600 text-white text-sm px-4 py-2 rounded-full transition"
          >
            <UploadCloud className="w-6 h-6" />
            Upload New Avatar
            <input
              type="file"
              id="avatar"
              accept="image/jpeg"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        {/* Update Name & Password */}
        <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm space-y-8">
          <form onSubmit={handleNameUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                className="input-field w-full px-3 py-2 bg-background border border-border rounded-md"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition"
            >
              Update Name
            </button>
          </form>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="••••••"
                className="input-field w-full px-3 py-2 pr-10 bg-background border border-border rounded-md"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-white"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="input-field w-full px-3 py-2 pr-10 bg-background border border-border rounded-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary w-full bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
