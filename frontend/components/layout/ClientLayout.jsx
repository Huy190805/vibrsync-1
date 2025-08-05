"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Player from "@/components/player";
import Header from "@/components/layout/header";
import { MusicProvider } from "@/context/music-context";
import { useAuth } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import Footer from "@/components/layout/Footer";
import ChatBoxLauncher from "@/components/chatbot/ChatBoxLauncher";

export default function ClientLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // -----------------------
  // Authentication & Redirect Logic
  // -----------------------
  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated
    if (!isAuthenticated && !["/signin", "/signup"].includes(pathname)) {
      router.push("/signin");
      return;
    }

    // Redirect based on role
    if (user) {
      const isAdminPage = pathname.startsWith("/admin");
      if (user.role === "admin" && !isAdminPage) {
        router.push("/admin/dashboard");
        return;
      } else if (user.role === "artist" && !pathname.startsWith("/role_artist")) {
        router.push("/role_artist/dashboard");
        return;
      } else if (user.role !== "admin" && isAdminPage) {
        router.push("/profile");
        return;
      }
    }

    // If all checks pass
    setReady(true);
  }, [user, isAuthenticated, loading, pathname, router]);

  // -----------------------
  // Loading State
  // -----------------------
  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  // -----------------------
  // Artist Layout
  // -----------------------
  if (pathname.startsWith("/role_artist")) {
    return (
      <NotificationProvider>
        <MusicProvider>{children}</MusicProvider>
      </NotificationProvider>
    );
  }

  // -----------------------
  // Admin Layout
  // -----------------------
  if (pathname.startsWith("/admin")) {
    return (
      <NotificationProvider>
        {children}
      </NotificationProvider>
    );
  }

  // -----------------------
  // Default User Layout
  // -----------------------
  return (
    <NotificationProvider>
      <MusicProvider>
        <div className="flex flex-col h-screen bg-gradient-to-b from-purple-900/10 to-black">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4">
              {children}
              <Footer />
            </main>
          </div>
          <Player />
          <ChatBoxLauncher />
        </div>
      </MusicProvider>
    </NotificationProvider>
  );
}