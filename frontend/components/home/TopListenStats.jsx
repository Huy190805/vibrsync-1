// components/home/TopListenStats.server.jsx
import TopListenStatsClient from "./TopListenStats.client";

export default async function TopListenStats() {
  const [topRes, topListenRes, topRepeatRes, topSearchRes] = await Promise.all([
    fetch("http://localhost:8000/api/listens/top-with-info?limit=20", { cache: "no-store" }),
    fetch("http://localhost:8000/api/listens/top?limit=50", { cache: "no-store" }),
    fetch("http://localhost:8000/api/listens/top-repeated?limit=50", { cache: "no-store" }),
    fetch("http://localhost:8000/api/listens/top-searched?limit=50", { cache: "no-store" }),
  ]);

  const topJson = await topRes.json();
  const topListenJson = await topListenRes.json();
  const topRepeatJson = await topRepeatRes.json();
  const topSearchJson = await topSearchRes.json();

  const rawSongs = (Array.isArray(topJson) ? topJson : topJson?.songs || []).filter(
    song => !!song.audioUrl
  );

  const songInfo = {};
  rawSongs.forEach((song) => {
    const key = (song.song_id || song._id)?.toString();
    if (key) {
      songInfo[key] = {
        title: song.title,
        artist: song.artist_name || song.artist,
      };
    }
  });

  const map = {};
  const normalizeKey = (item) => item._id?.toString();

  (topListenJson || []).forEach((item) => {
    const key = normalizeKey(item);
    map[key] = {
      songId: key,
      title: songInfo[key]?.title || "Unknown Title",
      artist: songInfo[key]?.artist || "Unknown Artist",
      listen: item.count || 0,
      repeat: 0,
      search: 0,
    };
  });

  (topRepeatJson || []).forEach((item) => {
    const key = normalizeKey(item);
    map[key] = map[key] || {
      songId: key,
      title: songInfo[key]?.title || "Unknown Title",
      artist: songInfo[key]?.artist || "Unknown Artist",
      listen: 0,
      repeat: 0,
      search: 0,
    };
    map[key].repeat = item.repeat_total || 0;
  });

  (topSearchJson || []).forEach((item) => {
    const key = normalizeKey(item);
    map[key] = map[key] || {
      songId: key,
      title: songInfo[key]?.title || "Unknown Title",
      artist: songInfo[key]?.artist || "Unknown Artist",
      listen: 0,
      repeat: 0,
      search: 0,
    };
    map[key].search = item.search_count || 0;
  });

  const topCombinedChart = Object.values(map)
    .filter((s) => s.listen > 0)
    .sort((a, b) => b.listen + b.repeat + b.search - (a.listen + a.repeat + a.search));

  return (
    <TopListenStatsClient
      topCombinedChart={topCombinedChart}
      topSongs={rawSongs}
    />
  );
}
