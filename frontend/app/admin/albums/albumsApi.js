import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_URL = "http://localhost:8000/api";

export async function fetchArtists() {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/admin/artists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}


export async function fetchAlbums(params = {}) {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();
  try {
    const response = await axios.get(`${API_URL}/admin/albums?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch albums response:", response.data);
    // Nếu response là mảng:
    if (Array.isArray(response.data)) return response.data;

    // Nếu response có field albums:
    if (Array.isArray(response.data.albums)) return response.data.albums;

    return [];
  } catch (error) {
    console.error("Fetch albums error:", error);
    throw new Error("Failed to load albums");
  }
}


export async function fetchAlbumById(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/admin/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch album by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetch album by ID error:", error);
    throw new Error("Album not found");
  }
}

export async function createAlbum(albumData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/admin/albums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(albumData),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join("; ")
      : detail || "Failed to create album";
    throw new Error(message);
  }

  return data;
}


export async function updateAlbum(id, data) {
  const token = localStorage.getItem("token");
  try {
    console.log("Update album data:", data);
    const response = await axios.put(`${API_URL}/admin/albums/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Update album response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update album error:", error);
    throw new Error("Failed to update album");
  }
}

export async function deleteAlbum(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(`${API_URL}/admin/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Delete album response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete album error:", error);
    throw new Error("Failed to delete album");
  }
}