import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_URL = "http://localhost:8000/api";

export async function fetchAlbums(params = {}) {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();
  try {
    const response = await axios.get(`${API_URL}/artist/albums?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Fetch albums response (artist):", response.data);

    // Đảm bảo luôn trả về mảng
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.albums)) return response.data.albums;

    return [];
  } catch (error) {
    console.error("Fetch albums (artist) error:", error);
    throw new Error("Failed to load albums");
  }
}

export async function createAlbum(albumData) {
  const token = localStorage.getItem("token");

  const response = await axios.post(`${API_URL}/artist/albums`, albumData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function updateAlbum(id, albumData) {
  const token = localStorage.getItem("token");

  const response = await axios.put(`${API_URL}/artist/albums/${id}`, albumData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function deleteAlbum(id) {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`${API_URL}/artist/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function fetchAllSongs() {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/songs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.songs || [];
}
