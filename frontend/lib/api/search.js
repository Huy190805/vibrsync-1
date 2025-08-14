/**
 * Gọi API tìm kiếm
 * @param {string} keyword  - Từ khoá người dùng nhập
 * @param {"all"|"song"|"artist"|"album"} type - Loại tìm (mặc định "all")
 * @returns {Promise<{songs:[], artists:[], albums:[]}>}
 */
export async function searchAll(keyword, type = "all") {
  const kw = (keyword || "").trim();
  if (!kw) return { songs: [], artists: [], albums: [] };

  const params = new URLSearchParams({ query: kw, type });
  const url = `http://localhost:8000/api/search?${params.toString()}`;

  const res = await fetch(url); // ✅ KHÔNG cần token nữa

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Search failed (${res.status}): ${msg}`);
  }

  return res.json();
}
