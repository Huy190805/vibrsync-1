import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_URL = "http://localhost:8000/api";

// Lấy token từ localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchPlaylists({ skip = 0, limit = 20, search = "" } = {}) {
  const query = new URLSearchParams({ skip, limit, search }).toString();
  try {
    const response = await axios.get(`${API_URL}/admin/playlists?${query}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw new Error("Failed to load playlists");
  }
}

export async function fetchPlaylistById(id) {
  try {
    const response = await axios.get(`${API_URL}/admin/playlists/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching playlist:", error);
    throw new Error(`Failed to load playlist ${id}`);
  }
}

export async function createPlaylist(data) {
  try {
    const response = await axios.post(`${API_URL}/playlists`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Create playlist error:", error);
    throw new Error("Failed to create playlist");
  }
}

export async function updatePlaylist(id, data) {
  try {
    const response = await axios.patch(`${API_URL}/playlists/${id}`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update playlist error:", error);
    throw new Error("Failed to update playlist");
  }
}

export async function deletePlaylist(id) {
  try {
    const response = await axios.delete(`${API_URL}/playlists/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Delete playlist error:", error);
    throw new Error("Failed to delete playlist");
  }
}

export async function uploadMedia(formData) {
  try {
    const response = await axios.post(`${API_URL}/admin/upload`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload media error:", error);
    throw new Error("Failed to upload media");
  }
}
