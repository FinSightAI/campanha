import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function genCode() {
  // 5 crypto-random bytes → 10 hex chars uppercase
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });

  const { data } = await req.json();
  if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  const code = genCode();
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

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.toUpperCase().trim();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

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
