function parseLRC(lrc) {
  const lines = lrc.split("\n").filter(Boolean);
  const timeRegex = /\[(\d{2}):(\d{2}\.\d{2})]/;
  return lines.map(line => {
    const match = line.match(timeRegex);
    if (!match) return null;
    const [_, min, sec] = match;
    const time = parseInt(min) * 60 + parseFloat(sec);
    const text = line.replace(timeRegex, "").trim();
    return { time, text };
  }).filter(Boolean);
}
