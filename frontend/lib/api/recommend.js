// File: lib/api/recommend.js

export async function fetchRecommendations(userId, limit = 12) {
  if (!userId) throw new Error("User ID is required for recommendations");

  try {
    const res = await fetch(
      `http://localhost:8000/api/recommendations?user_id=${userId}&limit=${limit}`
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch recommendations: ${errText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error.message);
    throw error;
  }
}
