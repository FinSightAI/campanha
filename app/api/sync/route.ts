import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

function genCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });

  const { data } = await req.json();
  if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  const code = genCode();
  await put(`sync/${code}.json`, JSON.stringify(data), {
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
    const { blobs } = await list({ prefix: `sync/${code}`, token });
    const blob = blobs[0];
    if (!blob) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const res = await fetch(blob.url);
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Error fetching sync data" }, { status: 500 });
  }
}
