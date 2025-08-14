"use client";

import { useState, useCallback } from "react";
import ChatBox from "./ChatBox";
import { MessageCircle } from "lucide-react";

export default function ChatToggleButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Sử dụng useCallback để tránh tái tạo hàm không cần thiết
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Xử lý click ra ngoài để đóng chatbox (tùy chọn)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Nút tròn mở/đóng */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isOpen ? "Đóng chat" : "Mở chat"}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbox hiển thị với overlay để đóng khi click ra ngoài */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleOverlayClick}
        >
          <ChatBox isOpen={isOpen} onClose={toggleChat} />
        </div>
      )}
    </>
  );
}