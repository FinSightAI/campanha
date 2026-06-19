import { put, list } from "@vercel/blob";
import { createHash } from "crypto";

// Monthly quota per account — tracks BOTH video count and seconds of generated video.
// Whichever limit is hit first blocks the next generation.
//
// Storage: one JSON blob per (month, identity). Read-modify-write is non-atomic;
// adequate for low-concurrency pilot. Revisit with Upstash INCR at scale.
//
// Env vars:
//   CAMPANHA_MONTHLY_VIDEO_LIMIT   — max videos/month   (default 5)
//   CAMPANHA_MONTHLY_SECONDS_LIMIT — max seconds/month  (default 600 = 10 min)

export type QuotaResult = {
  allowed: boolean;
  videos_used: number;
  videos_limit: number;
  seconds_used: number;
  seconds_limit: number;
  remaining_videos: number;
  remaining_seconds: number;
};

type QuotaData = {
  videos_used: number;
  seconds_used: number;
  updatedAt: string;
};

function videoLimit(): number {
  const n = parseInt(process.env.CAMPANHA_MONTHLY_VIDEO_LIMIT ?? "5", 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

function secondsLimit(): number {
  const n = parseInt(process.env.CAMPANHA_MONTHLY_SECONDS_LIMIT ?? "600", 10);
  return Number.isFinite(n) && n > 0 ? n : 600;
}

function period(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function pathFor(identity: string): string {
  const h = createHash("sha256").update(identity).digest("hex").slice(0, 16);
  return `quota/${period()}/${h}.json`;
}

// ~130 words/min for pt-BR political speech → 2.17 words/second
export function estimateSeconds(script: string): number {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(10, Math.ceil(words / 2.17));
}

async function readData(path: string, token: string): Promise<QuotaData> {
  try {
    const { blobs } = await list({ prefix: path, token });
    const blob = blobs.find((b) => b.pathname === path);
    if (!blob) return { videos_used: 0, seconds_used: 0, updatedAt: "" };
    const d = await fetch(blob.url, { cache: "no-store" }).then((r) => r.json());
    return {
      // backwards-compat: old blobs stored { used } not { videos_used }
      videos_used: typeof d.videos_used === "number" ? d.videos_used : (typeof d.used === "number" ? d.used : 0),
      seconds_used: typeof d.seconds_used === "number" ? d.seconds_used : 0,
      updatedAt: d.updatedAt ?? "",
    };
  } catch {
    return { videos_used: 0, seconds_used: 0, updatedAt: "" };
  }
}

function unlimited(vl: number, sl: number): QuotaResult {
  return { allowed: true, videos_used: 0, videos_limit: vl, seconds_used: 0, seconds_limit: sl, remaining_videos: vl, remaining_seconds: sl };
}

/** Check quota without consuming it. Pass estimatedSeconds to also verify time budget. */
export async function checkVideoQuota(identity: string, neededSeconds = 0): Promise<QuotaResult> {
  const vl = videoLimit();
  const sl = secondsLimit();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return unlimited(vl, sl);

  const data = await readData(pathFor(identity), token);
  const allowed = data.videos_used < vl && data.seconds_used + neededSeconds <= sl;

  return {
    allowed,
    videos_used: data.videos_used,
    videos_limit: vl,
    seconds_used: data.seconds_used,
    seconds_limit: sl,
    remaining_videos: Math.max(0, vl - data.videos_used),
    remaining_seconds: Math.max(0, sl - data.seconds_used),
  };
}

/** Consume one video + N seconds after a successful billed generation. */
export async function incrementVideoQuota(identity: string, seconds: number): Promise<QuotaResult> {
  const vl = videoLimit();
  const sl = secondsLimit();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return unlimited(vl, sl);

  const path = pathFor(identity);
  const existing = await readData(path, token);
  const updated: QuotaData = {
    videos_used: existing.videos_used + 1,
    seconds_used: existing.seconds_used + seconds,
    updatedAt: new Date().toISOString(),
  };

  await put(path, JSON.stringify(updated), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    contentType: "application/json",
  });

  return {
    allowed: updated.videos_used < vl && updated.seconds_used < sl,
    videos_used: updated.videos_used,
    videos_limit: vl,
    seconds_used: updated.seconds_used,
    seconds_limit: sl,
    remaining_videos: Math.max(0, vl - updated.videos_used),
    remaining_seconds: Math.max(0, sl - updated.seconds_used),
  };
}
