// frontend/lib/api/user.js

/**
 * Toggle like/unlike a song
 * @param {string} songId 
 * @param {string} token 
 * @returns {Promise<object>}
 */
export async function toggleLikeSong(songId, token) {
  const res = await fetch(`http://localhost:8000/user/me/toggle-like/${songId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`❌ toggleLikeSong error (${res.status}):`, error);
    throw new Error("Failed to like/unlike song");
  }

  return await res.json();
}


/**
 * Fetch the list of artists the current user is following
 * @returns {Promise<Array>} - List of artist objects
 */
export async function fetchFollowingArtists() {
  const token = localStorage.getItem("token");
  console.log("🔐 Token for fetchFollowingArtists:", token);

  if (!token) {
    console.warn("⚠️ Missing token when fetching following artists.");
    throw new Error("Missing token");
  }

  try {
    const res = await fetch("http://localhost:8000/user/me/following", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ fetchFollowingArtists error (${res.status}):`, errText);
      throw new Error(errText || "Failed to fetch following artists");
    }

    const data = await res.json();
    console.log("✅ Following artists fetched:", data);
    return data;
  } catch (err) {
    console.error("❌ Network or server error in fetchFollowingArtists:", err.message);
    throw err;
  }
}

// lib/api/user.js
export async function fetchHistory(userId) {
  const res = await fetch(`http://localhost:8000/api/history/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return await res.json();
}

export async function fetchLikedSongs() {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:8000/user/me/liked-songs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch liked songs");

  return await res.json(); 
}
