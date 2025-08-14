"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notification-context";
import { getAllPlaylists } from "@/lib/api/playlists";
import {
  fetchFollowingArtists,
} from "@/lib/api/user";
import { toast } from "@/components/ui/use-toast";
import RequestArtistPopup from "@/components/profile/RequestArtistPopup";
import ProfileHeader from "@/components/profile/ProfileHeader";

const CACHE_KEY_PROFILE_DATA = "profileDataCache";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [followingArtists, setFollowingArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();
  const router = useRouter();

  // Artist request state
  const [showNotice, setShowNotice] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    name: "",
    bio: "",
    social_links: [],
    genres: [],
    phone: "",
    image: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Try to load from sessionStorage first
      const cached = sessionStorage.getItem(CACHE_KEY_PROFILE_DATA);
      if (cached) {
        const parsed = JSON.parse(cached);
        setPlaylists(parsed.playlists || []);
        setFollowingArtists(parsed.following || []);
        setLoading(false);
        return;
      }

      const playlistData = await getAllPlaylists();
      const followingData = await fetchFollowingArtists();

      const limitedPlaylists = playlistData.slice(0, 8) || [];
      const followed = followingData.following || [];

      setPlaylists(limitedPlaylists);
      setFollowingArtists(followed);

      sessionStorage.setItem(
        CACHE_KEY_PROFILE_DATA,
        JSON.stringify({ playlists: limitedPlaylists, following: followed })
      );
    } catch (err) {
      console.error("❌ Error loading profile data:", err);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu hồ sơ.",
        variant: "destructive",
      });
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, fetchData, router]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/artist_requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...requestData,
          matched_artist_id: selectedArtistId || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit artist request");

      setSuccess("Artist request submitted successfully");
      addNotification({
        type: "info",
        title: "Artist Request Sent",
        message: "Your artist request has been sent and is pending review.",
        created_at: new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        }),
      });

      setShowRequestForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <ProfileHeader
        user={user}
        playlists={playlists}
        followingArtists={followingArtists}
        showNotice={showNotice}
        setShowNotice={setShowNotice}
        setShowRequestForm={setShowRequestForm}
        requestSent={requestSent}
      />

      {showRequestForm && (
        <RequestArtistPopup
          requestData={requestData}
          setRequestData={setRequestData}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          setShowRequestForm={setShowRequestForm}
          selectedArtistId={selectedArtistId}
          setSelectedArtistId={setSelectedArtistId}
          setRequestSent={setRequestSent}
          error={error}
          success={success}
          onSuccess={() => setRequestSent(true)}
          handleSubmit={handleRequestSubmit}
          closePopup={() => setShowRequestForm(false)}
        />
      )}
    </div>
  );
}
