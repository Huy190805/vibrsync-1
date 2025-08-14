"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/notification-context";
import axios from "axios";

export default function RequestArtistPopup({
  requestData,
  setRequestData,
  setShowRequestForm,
  selectedArtistId,
  setSelectedArtistId,
  setRequestSent,
}) {
  const { addNotification } = useNotifications();
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


const handleUploadImageToBackend = async (file, artistId, token) => {
  const formData = new FormData();
  formData.append("file", file);

const response = await fetch(`http://localhost:8000/api/artist_requests/${artistId}/upload-image`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`, // KHÔNG thêm Content-Type, để fetch tự đặt
  },
  body: formData,
});


  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return data.image; // Cloudinary URL
};

const handleRequestSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!requestData.name || !requestData.bio || !requestData.phone || !selectedImageFile) {
    setError("Please fill in all required fields (name, bio, phone, image).");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // 1️⃣ Gửi request artist (chưa có image)
    const createRes = await fetch("http://localhost:8000/api/artist_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...requestData,
        image: "", // để tạm
        matched_artist_id: selectedArtistId || null,
      }),
    });

    if (createRes.status === 409) {
      setError("You have already submitted a request. Please wait for admin approval.");
      return;
    }

    if (!createRes.ok) throw new Error("Failed to create artist request.");

    const created = await createRes.json();
    const artistRequestId = created.id;

    // 2️⃣ Upload ảnh
    const imageUrl = await handleUploadImageToBackend(selectedImageFile, artistRequestId, token);

    // ✅ Hiển thị thành công
    setSuccess("Artist request submitted successfully.");
    setRequestSent(true);
    setShowRequestForm(false);

    addNotification({
      type: "info",
      title: "Request Sent",
      message: "Your artist request has been submitted and is pending admin review.",
      created_at: new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
    });
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pr-2 no-scrollbar">
        <h2 className="text-2xl font-bold mb-4">Request Artist Role</h2>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-white p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Artist Name
            </label>
            <Input
              id="name"
              placeholder="Enter artist name..."
              value={requestData.name}
              onChange={(e) => {
                setRequestData({ ...requestData, name: e.target.value });
                setSelectedArtistId(null);
              }}
              required
            />
            {suggestions.length > 0 && (
              <ul className="bg-white shadow rounded mt-2 max-h-40 overflow-y-auto z-50">
                {suggestions.map((artist) => (
                  <li
                    key={artist.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRequestData({ ...requestData, name: artist.name });
                      setSelectedArtistId(artist.id);
                      setSuggestions([]);
                    }}
                  >
                    {artist.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <Textarea
              id="bio"
              value={requestData.bio}
              onChange={(e) => setRequestData({ ...requestData, bio: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
              Phone
            </label>
            <Input
              id="phone"
              value={requestData.phone}
              onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })}
            />
          </div>
         <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">
        Artist Image
        </label>
       <Input
       id="image"
       type="file"
       accept="image/*"
       onChange={(e) => {
       const file = e.target.files[0];
       if (!file) return;

       setSelectedImageFile(file);
       setImagePreview(URL.createObjectURL(file));
       }}
      />
     {imagePreview && (
     <div className="relative mt-2 w-full max-h-32 overflow-hidden rounded-md border border-white/10">
     <img
      src={imagePreview}
      alt="Preview"
      className="w-full h-full object-cover"
     />
     <button
      type="button"
      onClick={() => {
        setSelectedImageFile(null);
        setImagePreview(null);
      }}
      className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
      title="Remove image"
      >
      ✕
      </button>
      </div>
        )}
        </div>
          <div>
            <label htmlFor="genres" className="block text-sm font-medium text-gray-300 mb-1">
              Genres (comma-separated)
            </label>
            <Input
              id="genres"
              placeholder="Pop, Rock, EDM"
              value={requestData.genres.join(", ")}
              onChange={(e) =>
                setRequestData({
                  ...requestData,
                  genres: e.target.value.split(",").map((g) => g.trim()),
                })
              }
            />
          </div>

          <div>
            <label htmlFor="social_links" className="block text-sm font-medium text-gray-300 mb-1">
              Social Links (comma-separated)
            </label>
            <Input
              id="social_links"
              placeholder="https://facebook.com/you, https://instagram.com/you"
              value={requestData.social_links.join(", ")}
              onChange={(e) =>
                setRequestData({
                  ...requestData,
                  social_links: e.target.value.split(",").map((link) => link.trim()),
                })
              }
            />
          </div>

          <div className="flex gap-4 mt-4">
          <Button
         type="submit"
         className="bg-purple-600 text-white hover:bg-purple-700 w-full"
          >
          Submit Request
         </Button>
            <Button
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="btn-secondary w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
