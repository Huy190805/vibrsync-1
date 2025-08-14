"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { User, Pencil, Upload } from "lucide-react";

export default function ArtistAbout({ artist }) {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(artist?.bio || "");
  const [image, setImage] = useState(artist?.image || "");
  const [file, setFile] = useState(null); // File upload mới

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImage(URL.createObjectURL(selected));
    }
  };

const handleSave = async () => {
  alert("🔒 Bạn hãy chuyển sang tab Edit Profile (read-only).");
};

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 pointer-events-none">
      <div className="relative bg-gradient-to-br from-[#4b2672] to-[#301d4f] text-white w-full max-w-md rounded-2xl shadow-xl p-6 pointer-events-auto border border-purple-500 animate-fadeIn">
        <button
          onClick={() => {
            setEditing(false);
            setShowModal(false);
          }}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        {/* Artist Image */}
        <div className="relative w-36 h-36 mx-auto mb-4 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:scale-105">
          <Image
            src={image || "/placeholder.svg"}
            alt={artist.name}
            fill
            className="object-cover"
          />
        </div>

        {editing && (
          <div className="flex justify-center mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-purple-300 hover:text-purple-400">
              <Upload size={16} />
              Change Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        )}

        <h3 className="text-xl font-bold text-center mb-4 tracking-wide">{artist.name}</h3>

        {editing ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-md bg-[#412a66] text-gray-100 resize-none border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 scroll-container"
            />
            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-purple-600 rounded hover:bg-purple-500"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-300 text-sm leading-relaxed tracking-wide max-h-[50vh] overflow-y-auto pr-1 whitespace-pre-line scroll-container">
            {bio}
          </div>
        )}

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-sm text-purple-300 mt-4 hover:underline mx-auto"
          >
            <Pencil size={16} /> Edit Bio
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
        <User size={24} className="text-purple-400" /> About {artist.name}
      </h3>

      <div className="flex flex-col md:flex-row gap-8 bg-gradient-to-r from-[#3e2b59] to-[#1f1b2e] p-6 rounded-xl shadow-lg">
        <div className="md:w-1/3">
          <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-300/30">
            <Image
              src={artist.image || "/placeholder.svg"}
              alt={`${artist.name} profile`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:w-2/3 text-gray-300 text-base leading-relaxed tracking-wide">
          <p className="line-clamp-5 whitespace-pre-line">{artist.bio || "No bio available."}</p>
          {artist.bio && artist.bio.length > 200 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-sm text-purple-300 hover:underline"
            >
              See more
            </button>
          )}
        </div>
      </div>

      {mounted && showModal && createPortal(modal, document.body)}
    </div>
  );
}
