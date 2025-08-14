"use client";

import dynamic from "next/dynamic";

// 💡 Dynamic import để tạo chunk riêng, không SSR
const TopArtists = dynamic(() => import("./top-artists"), { ssr: false });
const HotAlbums = dynamic(() => import("./hot-albums"), { ssr: false });
const ListeningHistory = dynamic(() => import("./ListeningHistory"), { ssr: false });
const NewReleases = dynamic(() => import("./new-releases"), { ssr: false });
const TopListenStats = dynamic(() => import("./TopListenStats"), { ssr: false });
const ArtistFanSection = dynamic(() => import("./ArtistFanSection/ArtistFanSection"), { ssr: false });
const ChatBoxLauncher = dynamic(() => import("@/components/chatbot/ChatBoxLauncher"), { ssr: false });

export default function HomeClient() {
  return (
    <>
      <NewReleases />
      <TopListenStats />
      <ArtistFanSection />
      <ChatBoxLauncher />
      <TopArtists />
      <HotAlbums />
      <ListeningHistory />
    </>
  );
}
