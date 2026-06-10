// Generates a WebVTT string from script text using estimated ~130 words/min speaking rate
export function scriptToVTT(script: string): string {
  const WORDS_PER_MS = 130 / 60 / 1000;
  const CHUNK_WORDS = 8;

  const words = script.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "WEBVTT\n\n";

  let vtt = "WEBVTT\n\n";
  let timeMs = 0;

  for (let i = 0; i < words.length; i += CHUNK_WORDS) {
    const chunk = words.slice(i, i + CHUNK_WORDS);
    const durationMs = Math.round(chunk.length / WORDS_PER_MS);
    const start = formatVTTTime(timeMs);
    const end = formatVTTTime(timeMs + durationMs);
    vtt += `${start} --> ${end}\n${chunk.join(" ")}\n\n`;
    timeMs += durationMs;
  }

  return vtt;
}

function formatVTTTime(ms: number): string {
  const totalSec = ms / 1000;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = (totalSec % 60).toFixed(3);
  return `${pad(h)}:${pad(m)}:${s.padStart(6, "0")}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
