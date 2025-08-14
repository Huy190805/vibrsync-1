"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth(); // ✅ lấy user từ context

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    localStorage.setItem("token", token);

    refreshUser().catch(() => {
      router.push("/signin");
    });
  }, [searchParams, router, refreshUser]);

  useEffect(() => {
    if (user?.role) {
      router.push(
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "artist"
          ? "/role_artist/dashboard"
          : "/"
      );
    }
  }, [user?.role, router]);

  return (
<div className="flex items-center justify-center min-h-screen text-white">
  <div className="flex flex-col items-center gap-4">
    <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
    <p className="text-sm text-gray-400">Đang xác thực tài khoản Google...</p>
  </div>
</div>
  );
}
