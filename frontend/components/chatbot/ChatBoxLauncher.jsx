"use client";

import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { useAuth } from "@/context/auth-context";

export default function ChatBoxLauncher() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth(); // ✅ Dùng từ context

  useEffect(() => {
    localStorage.setItem("isChatOpen", isChatOpen.toString());
  }, [isChatOpen]);

  if (loading) return null; // ⏳ Đợi xác thực xong mới hiển thị
  if (!isAuthenticated) return null; // 🔒 Không hiển thị nếu chưa đăng nhập

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-50"
      >
        💬
      </button>

      {isChatOpen && (
        <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
}