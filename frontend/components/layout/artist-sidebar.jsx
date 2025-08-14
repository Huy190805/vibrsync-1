"use client";

import Link from "next/link";
import { Music, User, BarChart2, Home } from "lucide-react";

export default function ArtistSidebar() {
  return (
    <div className="p-4">
      <Link
  href=""
  className="group flex items-center gap-3 mb-8 cursor-pointer relative w-max"
>
  <div
    className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-visible bg-gradient-to-br from-purple-700 to-purple-900 shadow-lg"
  >
    {/* 3 vòng tròn sóng nhạc màu tím với hiệu ứng sóng như bạn muốn */}
    <span className="absolute w-14 h-14 rounded-full border-2 border-purple-400 animate-wave"></span>
    <span className="absolute w-14 h-14 rounded-full border-2 border-purple-400 animate-wave delay-300"></span>
    <span className="absolute w-14 h-14 rounded-full border-2 border-purple-400 animate-wave delay-600"></span>

    {/* Icon Music nhỏ hơn (w-9 h-9), nghiêng nhẹ sang phải, lắc nhẹ */}
    <svg
      className="w-9 h-9 relative z-10 animate-wobble-tilt"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transformOrigin: 'center bottom' }}
    >
      <defs>
        <linearGradient id="gradientMusic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Cột nốt nhạc */}
      <rect
        x="9"
        y="2"
        width="2"
        height="14"
        fill="url(#gradientMusic)"
        rx="1"
      />
      {/* Nốt nhạc tròn */}
      <circle cx="10" cy="19" r="4" fill="url(#gradientMusic)" />
      {/* Đường cong nối */}
      <path
        d="M11 2C13 3 16 4 16 7C16 9 14 11 12 11"
        stroke="url(#gradientMusic)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Sao lấp lánh xung quanh icon music */}
    <span className="absolute top-2 left-2 w-1.5 h-1.5 bg-white opacity-80 clip-star animate-sparkle"></span>
    <span className="absolute top-5 right-2 w-1 h-1 bg-white opacity-70 clip-star animate-sparkle delay-200"></span>
    <span className="absolute bottom-2 left-4 w-1 h-1 bg-white opacity-70 clip-star animate-sparkle delay-400"></span>
  </div>

<span className="fancy-text select-none">VibeSync</span>

  <style jsx>{`
    /* Sóng nhạc */
    @keyframes wave {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      70% {
        opacity: 0.1;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    .animate-wave {
      animation: wave 2s linear infinite;
    }
    .delay-300 {
      animation-delay: 0.3s;
    }
    .delay-600 {
      animation-delay: 0.6s;
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

    /* Text glow */
    .glow-text {
      text-shadow: 0 0 6px rgba(167, 139, 250, 0.8);
    }

    /* Animation lắc nghiêng sang phải */
    @keyframes wobble-tilt {
      0%, 100% {
        transform: rotate(8deg);
      }
      50% {
        transform: rotate(12deg);
      }
    }
    .animate-wobble-tilt {
      animation: wobble-tilt 3s ease-in-out infinite;
      transform-origin: center bottom;
    }
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&display=swap');

  .fancy-text {
    font-family: 'Baloo 2', cursive;
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    position: relative;
    display: inline-block;
    transform-origin: left bottom;
    transform: skew(-10deg);
    text-shadow:
      3px 0 0 #7c3aed,
      -3px 0 0 #7c3aed,
      0 3px 0 #7c3aed,
      0 -3px 0 #7c3aed,
      2px 2px 5px rgba(124, 58, 237, 0.7);
    letter-spacing: 0.1em;
  }

  .fancy-text::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #a78bfa, #f472b6, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    z-index: -1;
    filter: blur(4px);
  }
  `}</style>
</Link>

      <nav className="space-y-4">
        <Link
          href="/role_artist/dashboard"
          className="block p-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition"
        >
          <Home size={18} className="inline mr-2" />
          Dashboard
        </Link>
        <Link
          href="/role_artist/songs"
          className="block p-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition"
        >
          <Music size={18} className="inline mr-2" />
          My Songs
        </Link>
        <Link
          href="/role_artist/statistics"
          className="block p-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition"
        >
          <BarChart2 size={18} className="inline mr-2" />
          Statistics
        </Link>
        <Link
          href="/role_artist/profile/view"
          className="block p-2 rounded text-gray-400 hover:bg-white/5 hover:text-white transition"
        >
          <User size={18} className="inline mr-2" />
          Profile
        </Link>
      </nav>
    </div>
  );
}
