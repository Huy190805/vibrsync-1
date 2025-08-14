import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_URL = "http://localhost:8000/api";

export async function fetchSongs(params = { skip: 0, limit: 100 }) {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();
  try {
    const response = await axios.get(`${API_URL}/admin/songs?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch songs response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Fetch songs error:", error);
    throw new Error("Failed to load songs");
  }
}

export async function fetchArtists() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/admin/artists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch artists error:", error);
    throw new Error("Failed to load artists");
  }
}

export async function fetchArtistById(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/admin/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Fetch artist by id error:", error);
    throw new Error(`Failed to load artist ${id}`);
  }
}

export async function fetchAlbums() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/admin/albums`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch albums response:", JSON.stringify(response.data, null, 2));
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Fetch album by id error:", error);
    throw new Error(`Failed to load album ${id}`);
  }
}

export async function createSong(data) {
  const token = localStorage.getItem("token");

  // ép kiểu trước khi gọi API
  const cleaned = {
    ...data,
    releaseYear: parseInt(data.releaseYear, 10),
    duration: parseInt(data.duration, 10),
    artist: data.artist || "Unknown Artist",
    
  };

  // xoá field không thuộc schema
  delete cleaned.artistImage;

  try {
    console.log("createSong cleaned payload", cleaned);
    const response = await axios.post(`${API_URL}/admin/songs`, cleaned, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Create song error:", error);
    throw new Error("Failed to create song");
  }
}


export async function updateSong(id, data) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(`${API_URL}/admin/songs/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Update song error:", error);
    throw new Error("Failed to update song");
  }
}

export async function deleteSong(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(`${API_URL}/admin/songs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Delete song error:", error);
    throw new Error("Failed to delete song");
  }
}

export async function uploadMedia(formData) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(`${API_URL}/admin/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload media error:", error);
    throw new Error("Failed to upload media");
  }
}