import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { rateLimit } from "@/lib/rateLimit";

function genCode() {
  // 8 crypto-random bytes → 16 hex chars uppercase (~3.4e38 space).
  return randomBytes(8).toString("hex").toUpperCase();
}

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function codeExists(code: string, token: string) {
  const { blobs } = await list({ prefix: `sync/${code}.json`, token });
  return blobs.some((b) => b.pathname === `sync/${code}.json`);
}

export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });

  // Limit how fast codes can be minted (blob-write cost + abuse).
  if (!rateLimit(`sync-post:${clientIp(req)}`, 10, 60)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { data } = await req.json();
  if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  // Generate a code that doesn't already exist so we never overwrite another
  // user's payload on a collision.
  let code = genCode();
  for (let i = 0; i < 5 && (await codeExists(code, token)); i++) code = genCode();

  // Store with a 24-hour expiry timestamp
  const payload = JSON.stringify({ data, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  await put(`sync/${code}.json`, payload, {
    access: "public",
    addRandomSuffix: false,
    token,
    contentType: "application/json",
  });

  return NextResponse.json({ code });
}

export async function GET(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });

  // Rate-limit lookups so codes can't be brute-force enumerated.
  if (!rateLimit(`sync-get:${clientIp(req)}`, 10, 60)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase().trim();
  if (!code || !/^[0-9A-F]{16}$/.test(code)) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const { blobs } = await list({ prefix: `sync/${code}.json`, token });
    const blob = blobs.find(b => b.pathname === `sync/${code}.json`);
    if (!blob) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const res = await fetch(blob.url);
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    const payload = await res.json();
    // Check expiry
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return NextResponse.json({ error: "Code expired" }, { status: 410 });
    }
    return NextResponse.json({ data: payload.data });
  } catch {
    return NextResponse.json({ error: "Error fetching sync data" }, { status: 500 });
  }
}
