"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Player from "@/components/player";
import Header from "@/components/layout/header";
import { MusicProvider } from "@/context/music-context";
import { useAuth } from "@/context/auth-context";
import { NotificationProvider } from "@/context/notification-context";
import ChatBoxLauncher from "@/components/chatbot/ChatBoxLauncher";

export default function ClientLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Redirect unauthenticated
    if (!isAuthenticated && pathname !== "/signin" && pathname !== "/signup") {
      router.push("/signin");
      return;
    }

    // Redirect if role mismatch
    if (user) {
      if (user.role === "admin" && !pathname.startsWith("/admin")) {
        router.push("/admin/dashboard");
        return;
      } else if (user.role === "artist" && !pathname.startsWith("/role_artist")) {
        router.push("/role_artist/dashboard");
        return;
      } else if (user.role !== "admin" && pathname.startsWith("/admin")) {
        router.push("/profile");
        return;
      }
    }

    // If passed all guards
    setShouldRender(true);
  }, [user, isAuthenticated, loading, pathname, router]);

  if (loading || !shouldRender) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  // ROLE-BASED LAYOUT
  if (pathname.startsWith("/role_artist")) {
    return (
      <NotificationProvider>
        <MusicProvider>{children}</MusicProvider>
      </NotificationProvider>
    );
  }

  if (pathname.startsWith("/admin")) {
    return (
      <NotificationProvider>
        {children}
      </NotificationProvider>
    );
  }

  // DEFAULT LAYOUT FOR NORMAL USER
  return (
    <NotificationProvider>
      <MusicProvider>
        <div className="flex flex-col h-screen bg-gradient-to-b from-purple-900/10 to-black">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4">{children}</main>
          </div>
          <Player />
          <ChatBoxLauncher />
        </div>
      </MusicProvider>
    </NotificationProvider>
  );
}