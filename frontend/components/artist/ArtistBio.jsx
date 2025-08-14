"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function ArtistBio({ name, bio, image }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8 pointer-events-none">
      <div className="relative bg-[#2f1c47] text-white w-full max-w-md rounded-xl shadow-2xl p-5 animate-fadeIn overflow-y-auto max-h-[90vh] border border-purple-700 pointer-events-auto">
        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        {/* Artist Image on Top */}
        <div className="relative w-36 h-36 mx-auto mb-4 rounded-xl overflow-hidden shadow-md">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Bio Content */}
        <h3 className="text-xl font-bold text-center mb-3">{name}</h3>
        <div className="text-gray-300 text-sm leading-relaxed tracking-wide overflow-y-auto pr-1 max-h-[40vh] scroll-container">
          <p className="whitespace-pre-line">{bio}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mt-2 text-gray-300 max-w-xl overflow-hidden">
        <p className="line-clamp-3">{bio || "No bio available."}</p>
        {bio && bio.length > 200 && (
          <button
            onClick={() => setShow(true)}
            className="mt-1 text-sm text-green-400 hover:underline"
          >
            See more
          </button>
        )}
      </div>

      {mounted && show && createPortal(modalContent, document.body)}
    </>
  );
}
