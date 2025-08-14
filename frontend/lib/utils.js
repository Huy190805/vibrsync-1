import { clsx } from "clsx";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Gọi API từ backend
 * @param {string} endpoint - API path (vd: "/api/artists")
 * @param {object} options - fetch options (method, body, headers...)
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, mergedOptions);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API Error (${res.status}): ${errorText}`);
      throw new Error(`API Error: ${res.status} - ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    if (options.fallbackOnError === undefined) return null;
    return options.fallbackOnError;
  }
}

// Định dạng thời gian từ giây -> phút:giây
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
}

// Hỗ trợ className động
export function cn(...inputs) {
  return clsx(inputs);
}