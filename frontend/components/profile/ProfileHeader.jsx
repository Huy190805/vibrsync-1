"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Settings, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ProfileHeader({
  user,
  playlists,
  followingArtists,
  showNotice,
  setShowNotice,
  setShowRequestForm,
  requestSent,
  setRequestSent
}) {
  const router = useRouter();
  const { user: authUser } = useAuth();

  // Lọc playlist theo user đang đăng nhập
  const myPlaylists = playlists?.filter(
    (pl) => pl.creator === authUser?.id || pl.userId === authUser?.id
  ) || [];

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-32 h-32 rounded-full overflow-hidden">
        <Image
          src={user?.avatar || "/placeholder.svg?height=128&width=128&query=user+avatar"}
          alt="Profile"
          fill
          className="object-cover"
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {user?.name || "User Name"}
          {user?.role === "artist" && (
            <Image
              src="/verified-badge-3d-icon.png"
              alt="Verified Artist"
              width={50}
              height={50}
              className="w-16 h-12"
            />
          )}
        </h1>
        <p className="text-gray-400">{user?.email || "user@example.com"}</p>
        <div className="flex gap-4 mt-2">
          <div>
            <span className="text-gray-400">Playlists</span>
            <p className="font-semibold">{myPlaylists.length}</p>
          </div>
          <div>
            <span className="text-gray-400">Following</span>
            <p className="font-semibold">{followingArtists.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          {user?.role !== "artist" && (
            !showNotice ? (
              <Button
                onClick={() => setShowNotice(true)}
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md transition"
              >
                <UserPlus size={18} />
                Become an Artist
              </Button>
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-3 rounded-lg space-y-2 w-full">
                <p className="text-sm">
                  By requesting an artist role, your account will be reviewed.
                </p>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => setShowRequestForm(true)} className="btn-primary">
                    Continue
                  </Button>
                  <Button variant="secondary" onClick={() => setShowNotice(false)}>
                    Cancel
                  </Button>
                </div>
                {requestSent && (
                  <div className="bg-blue-500/20 border border-blue-500 text-white p-3 rounded-lg mb-4">
                    You have successfully submitted a request. Please wait for admin approval.
                  </div>
                )}
              </div>
            )
          )}

          <Button
            onClick={() => router.push("/profile/settings")}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md transition"
          >
            <Settings size={18} />
            Account Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
