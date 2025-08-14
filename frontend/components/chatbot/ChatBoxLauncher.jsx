"use client";

import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { Headphones } from "lucide-react";

export default function ChatBoxLauncher() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("isChatOpen");
    if (saved === "true") setIsChatOpen(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("isChatOpen", isChatOpen.toString());
  }, [isChatOpen]);

  return (
    <>
      <div className="fixed bottom-20 right-6 z-50">
        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="Open Chatbot Music"
          className="group relative w-16 h-16 flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:-translate-y-1 chat-bubble"
        >
          {/* Icon ở giữa - to hơn + lấp lánh */}
          <Headphones className="w-9 h-8 text-white relative z-10 animate-sparkle-icon" />

          {/* Sao lấp lánh */}
          <span className="absolute top-2 left-3 w-1.5 h-1.5 bg-white opacity-80 clip-star animate-sparkle"></span>
          <span className="absolute top-4 right-3 w-1 h-1 bg-white opacity-70 clip-star animate-sparkle delay-200"></span>
          <span className="absolute bottom-3 left-5 w-1 h-1 bg-white opacity-70 clip-star animate-sparkle delay-400"></span>

          {/* Tooltip */}
          <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-purple-900 px-2 py-0.5 text-xs font-semibold text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg select-none">
            Chatbot Music
          </span>
        </button>
      </div>

      {isChatOpen && (
        <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}

<style jsx>{`
  /* Bong bóng tròn */
  .chat-bubble {
    background: linear-gradient(135deg, #5b21b6, #7c3aed);
    border-radius: 50%;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18),
      inset 0 -2px 4px rgba(0, 0, 0, 0.06);

    /* Thêm hiệu ứng pulse nhấp nhẹ liên tục */
    animation: pulse 2.5s ease-in-out infinite;
  }

  /* Khi hover thì tắt animation pulse, thay bằng scale + translate như bạn muốn */
  .chat-bubble:hover {
    animation: none;
    transform: scale(1.1) translateY(-0.25rem);
  }

  /* Đuôi cong nhỏ kiểu Messenger */
  .chat-bubble::after {
    content: "";
    position: absolute;
    bottom: 4px;
    left: -6px;
    width: 13px;
    height: 11px;
    background: linear-gradient(135deg, #5b21b6, #7c3aed);
    border-bottom-right-radius: 10px;
    transform: rotate(45deg);
    box-shadow: -1px 1px 3px rgba(0, 0, 0, 0.15);
  }

  /* Animation sparkle cho sao */
  @keyframes sparkle {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1.3) rotate(15deg);
    }
  }
  .animate-sparkle {
    animation: sparkle 1.5s ease-in-out infinite;
  }
  .animate-sparkle.delay-200 {
    animation-delay: 0.2s;
  }
  .animate-sparkle.delay-400 {
    animation-delay: 0.4s;
  }

  /* Lấp lánh icon tai nghe */
  @keyframes sparkle-icon {
    0%, 100% {
      filter: drop-shadow(0 0 3px #a78bfa);
    }
    50% {
      filter: drop-shadow(0 0 6px #c084fc);
    }
  }
  .animate-sparkle-icon {
    animation: sparkle-icon 1.8s ease-in-out infinite;
  }

  /* Hình sao */
  .clip-star {
    clip-path: polygon(
      50% 0%,
      61% 35%,
      98% 35%,
      68% 57%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 57%,
      2% 35%,
      39% 35%
    );
  }

  /* Tooltip mobile-friendly */
  @media (hover: none) {
    .group:hover .pointer-events-none {
      opacity: 1 !important;
    }
  }

  /* Animation pulse cho chat bubble */
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }
`}</style>

    </>
  );
}
