"use client";

import Header from "@/components/layout/header";
import Player from "@/components/player";
import ArtistSidebar from "@/components/layout/artist-sidebar";
import RoleGuard from "@/components/guards/RoleGuard";
import { MusicProvider } from "@/context/music-context";
import { NotificationProvider } from "@/context/notification-context";

export default function ArtistLayout({ children }) {
  return (
    <RoleGuard role="artist">
      <NotificationProvider>
        <MusicProvider>
          <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900/10 to-black text-white">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50">
              <Header />
            </div>

            {/* Fixed Player */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <Player />
            </div>

            {/* Main layout: Sidebar + Content */}
            <div className="pt-16 pb-20 flex">
              {/* Sidebar container */}
              <aside className="w-64 h-[calc(100vh-64px-80px)] sticky top-16 overflow-y-auto bg-black/30 border-r border-green-500/30 shadow-xl">
                <ArtistSidebar />
              </aside>

              {/* Main content */}
              <main className="flex-1 h-[calc(100vh-64px-80px)] overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </MusicProvider>
      </NotificationProvider>
    </RoleGuard>
  );
}
