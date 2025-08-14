import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const API_URL = "http://localhost:8000/api";

export async function fetchArtists(params = {}) {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${API_URL}/admin/artists?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchArtistById(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/admin/artists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetch artist by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetch artist by ID error:", error);
    throw new Error(`Artist not found: ${id}`);
  }
}

export async function createArtist(data) {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/admin/artists`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}