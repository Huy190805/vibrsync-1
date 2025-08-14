"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Music, UploadCloud,Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/auth-context";
import axios from "axios"

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/<your_cloud_name>/"

export default function ProfileAccountSetting() {
  const [user, setUser] = useState(null)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const [newName, setNewName] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { refreshUser } = useAuth();

  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setUser(res.data)
      setNewName(res.data.name) // ✅ Hiển thị tên người dùng hiện tại
    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/signin")
      } else {
        setError("Failed to fetch user data")
      }
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.toLowerCase().split(".").pop()
    if (!["jpg", "jpeg"].includes(ext)) {
      setError("Only JPG files are allowed.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.")
      return
    }

    setError("")
    setSuccess("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      await axios.post("http://localhost:8000/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      await fetchUserData();
      await refreshUser();
      setSuccess("Avatar updated!")
    } catch (err) {
      setError("Failed to upload avatar")
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await axios.post(
        "http://localhost:8000/user/change-password",
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      setSuccess("Password updated successfully")
      setOldPassword("")
      setNewPassword("")
    } catch (err) {
      setError("Incorrect old password or error occurred")
    }
  }

  const handleNameUpdate = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await axios.patch(
        "http://localhost:8000/user/user/update-name",
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      await refreshUser();
      await fetchUserData()
      setSuccess("Name updated successfully")
    } catch (err) {
      setError("Failed to update name")
    }
  }

  if (!user) return <div className="text-white p-10">Loading profile...</div>

  return (
    <div className="relative min-h-[90vh] text-white overflow-hidden">
      {/* Go Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-gray-300 hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Page Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-4">
          <Music size={32} />
        </div>
        <h2 className="text-3xl font-bold">Your Profile</h2>
        <p className="text-gray-400 mt-2">Manage your info and security</p>
      </div>

      {/* Error / Success Messages */}
      <div className="max-w-5xl mx-auto">
        {error && <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-white p-3 rounded-lg mb-4">{success}</div>}
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: Avatar Section */}
        <div className="bg-white/5 p-6 h-96 rounded-2xl backdrop-blur-sm flex flex-col items-center justify-center space-y-4 text-center">
          <img
            src={
              user.avatar?.startsWith("http")
                ? user.avatar
                : `${CLOUDINARY_BASE_URL}${user.avatar || "images/default.jpg"}`
            }
            alt="Avatar"
            className="w-40 h-40 rounded-full object-cover border-2 border-purple-500"
            onError={(e) => (e.target.src = "/placeholder.svg")}
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

        {/* RIGHT: Update Name & Password */}
        <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm space-y-8">
          {/* Update Name */}
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

          {/* Change Password */}
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
  )
}
