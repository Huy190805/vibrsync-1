// frontend/lib/api/listen.js

/**
 * Ghi nhận lượt nghe hợp lệ (nghe ≥30s)
 * @param {string} userId 
 * @param {string} songId 
 * @param {string} listenedAt - ISO timestamp (ex: new Date().toISOString())
 * @returns {Promise<void>}
 */
export async function recordFullListen(userId, songId, listenedAt) {
  try {
    const res = await fetch("http://localhost:8000/user/history/full-listen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        song_id: songId,
        listened_at: listenedAt,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`❌ recordFullListen failed (${res.status}):`, error);
      throw new Error("Failed to record full listen");
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Network or server error in recordFullListen:", err.message);
    throw err;
  }
}

// Thống kê lượt nghe (dùng chung cho cả user và admin)
export async function countTotalListens() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:8000/api/admin/statistics/total-listens", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`❌ Failed to fetch total listens (${res.status}):`, error);
    throw new Error("Failed to fetch total listens");
  }

  return await res.json(); // => { total_listens: 123 }
}


export async function getTopListenedSongs(limit = 10) {
  const res = await fetch(`http://localhost:8000/api/listens/top?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top listened songs");
  return await res.json(); 
}

export async function getListenActivityByDate() {
  const res = await fetch(`http://localhost:8000/api/listens/activity-by-date`);
  if (!res.ok) throw new Error("Failed to fetch listen activity by date");
  return await res.json(); 
}

export async function getTopRepeatedSongs(limit = 10) {
  const res = await fetch(`http://localhost:8000/api/listens/top-repeated?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top repeated songs");
  return await res.json();
}

export async function getTopArtistsByListens(limit = 10) {
  const res = await fetch(`http://localhost:8000/api/listens/top-artists?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top artists");
  return await res.json();
}


// Dành riêng cho Admin - xem biểu đồ lượt nghe theo ngày
export async function getListenActivityByDateAdmin(startDate, endDate) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:8000/api/admin/statistics/listen-activity?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error(`❌ Failed to fetch admin listen activity (${res.status}):`, error);
    throw new Error("Failed to fetch admin listen activity");
  }

  return await res.json(); 
}

/**
 * Ghi nhận lượt tìm kiếm khi user chọn bài hát từ kết quả search
 * @param {string} userId 
 * @param {string} songId 
 */
export async function recordSearch(userId, songId) {
  try {
    const res = await fetch("http://localhost:8000/user/history/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        song_id: songId,
        searched_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("❌ recordSearch failed:", error);
    }
  } catch (err) {
    console.error("❌ recordSearch error:", err.message);
  }
}

export async function getTopArtistsCombined(limit = 10) {
  const res = await fetch(`http://localhost:8000/api/listens/top-artists-combined?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch top artists combined");
  return await res.json();
}
