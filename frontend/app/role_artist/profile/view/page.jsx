"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ProfileAccountSetting from "@/components/settings/page";

export default function ArtistProfileView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="flex justify-center items-center h-[60vh]">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-600">
          <Image
            src={user?.avatar || "/placeholder.svg"}
            alt="Artist Avatar"
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2 text-white">
            {user?.name}
            {user?.role === "artist" && (
              <Image
                src="/verified-badge-3d-icon.png"
                alt="Verified"
                width={40}
                height={40}
                className="ml-2"
              />
            )}
          </h1>
          <p className="text-gray-300">Email: {user?.email}</p>
          <p className="text-gray-400 mt-2">Role: {user?.role}</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="mt-16">
        <ProfileAccountSetting />
      </div>
    </div>
  );
}