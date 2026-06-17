import { put, list } from "@vercel/blob";
import { createHash } from "crypto";

// Monthly per-account video-generation quota.
//
// Identity = the D-ID account (its API key), which maps directly to whom D-ID
// bills — so this counter measures real cost. Works per-customer once multiple
// users bring their own keys; for the pilot (shared default DID_API_KEY) it is
// effectively one quota for the pilot account.
//
// Storage is a small JSON blob per (month, account). The read-modify-write is
// NOT atomic; adequate for low-concurrency pilot use (one user, sequential
// generations). Revisit with an atomic store (Upstash INCR) for scale.

export type QuotaResult = { allowed: boolean; used: number; limit: number; remaining: number };

function limitFromEnv(): number {
  const n = parseInt(process.env.CAMPANHA_MONTHLY_VIDEO_LIMIT ?? "15", 10);
  return Number.isFinite(n) ? n : 15;
}

function period(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function pathFor(identity: string): string {
  const h = createHash("sha256").update(identity).digest("hex").slice(0, 16);
  return `quota/${period()}/${h}.json`;
}

async function readUsed(path: string, token: string): Promise<number> {
  try {
    const { blobs } = await list({ prefix: path, token });
    const blob = blobs.find((b) => b.pathname === path);
    if (!blob) return 0;
    const d = await fetch(blob.url, { cache: "no-store" }).then((r) => r.json());
    return typeof d.used === "number" ? d.used : 0;
  } catch {
    return 0;
  }
}

/** Check remaining quota without consuming it. */
export async function checkVideoQuota(identity: string): Promise<QuotaResult> {
  const limit = limitFromEnv();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  // limit <= 0 means "unlimited" (admin/your own testing); also if unconfigured.
  if (!token || limit <= 0) return { allowed: true, used: 0, limit, remaining: Number.POSITIVE_INFINITY };
  const used = await readUsed(pathFor(identity), token);
  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}

/** Consume one unit after a billed generation succeeds. Returns the new state. */
export async function incrementVideoQuota(identity: string): Promise<QuotaResult> {
  const limit = limitFromEnv();
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || limit <= 0) return { allowed: true, used: 0, limit, remaining: Number.POSITIVE_INFINITY };
  const path = pathFor(identity);
  const used = (await readUsed(path, token)) + 1;
  await put(path, JSON.stringify({ used, updatedAt: new Date().toISOString() }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true, // same path is rewritten each increment
    token,
    contentType: "application/json",
  });
  return { allowed: used < limit, used, limit, remaining: Math.max(0, limit - used) };
}
