"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function RoleGuard({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== role) {
      router.push("/signin"); // hoặc "/profile" tùy mục tiêu
    }
  }, [user, loading, role, router]);

  if (loading || user?.role !== role) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading...</div>;
  }

  return children;
}
