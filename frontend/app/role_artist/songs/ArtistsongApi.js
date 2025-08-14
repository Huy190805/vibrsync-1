import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_URL = "http://localhost:8000/api";

export const fetchSongs = async (params = {}) => {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();
  try {
    const response = await axios.get(`${API_URL}/artist/songs?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch songs response:", response.data);
    return response.data.songs || [];
  } catch (error) {
    console.error("Fetch songs error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to fetch songs");
  }
};

export const fetchSongById = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/artist/songs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch song by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetch song by ID error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to fetch song");
  }
};

export const createSong = async (songData) => {
  const token = localStorage.getItem("token");
  try {
    console.log("Creating song with data:", songData);
    const response = await axios.post(`${API_URL}/artist/songs`, songData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data, message: "Song created successfully!" };
  } catch (error) {
    console.error("Create song error:", error.response?.data);

    // Lấy lỗi chi tiết (có thể là chuỗi hoặc object)
    let errorMessage = "Failed to create song";
    if (typeof error.response?.data?.detail === "string") {
      errorMessage = error.response.data.detail;
    } else if (typeof error.response?.data?.detail === "object") {
      // Nếu detail là object (ví dụ dict từ FastAPI), stringify lại
      errorMessage = JSON.stringify(error.response.data.detail);
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};


export const updateSong = async (id, songData) => {
  const token = localStorage.getItem("token");
  try {
    console.log("Updating song with ID:", id, "data:", songData);
    const response = await axios.put(`${API_URL}/artist/songs/${id}`, songData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { data: response.data, message: "Song updated successfully!" };
  } catch (error) {
    console.error("Update song error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to update song");
  }
};

export const deleteSong = async (id) => {
  const token = localStorage.getItem("token");
  try {
    console.log("Deleting song with ID:", id);
    await axios.delete(`${API_URL}/artist/songs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { message: "Song deleted successfully!" };
  } catch (error) {
    console.error("Delete song error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to delete song");
  }
};

export const fetchArtistById = async (id) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch artist response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetch artist error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to fetch artist");
  }
};

export async function fetchAlbums(params = {}) {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();
  try {
    const response = await axios.get(`${API_URL}/artist/albums?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch albums response:", response.data);
    return Array.isArray(response.data) ? response.data : response.data.albums || [];
  } catch (error) {
    console.error("Fetch albums error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to load albums");
  }
};

export async function uploadMedia(formData) {
  const token = localStorage.getItem("token");
  try {
    console.log("Uploading media with formData:", formData);
    const response = await axios.post(`${API_URL}/artist/songs/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Upload media response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload media error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to upload media");
  }
};

export async function createAlbum(albumData) {
  const token = localStorage.getItem("token");
  try {
    console.log("Creating album with data:", albumData);
    const response = await axios.post(`${API_URL}/artist/albums`, albumData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Create album error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to create album");
  }
};

export async function updateAlbum(id, albumData) {
  const token = localStorage.getItem("token");
  try {
    console.log("Updating album with ID:", id, "data:", albumData);
    const response = await axios.put(`${API_URL}/artist/albums/${id}`, albumData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update album error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to update album");
  }
};

export async function deleteAlbum(id) {
  const token = localStorage.getItem("token");
  try {
    console.log("Deleting album with ID:", id);
    const response = await axios.delete(`${API_URL}/artist/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Delete album error:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to delete album");
  }
};