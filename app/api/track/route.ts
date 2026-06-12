import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function genId() {
  return randomBytes(4).toString("hex"); // 32-bit CSPRNG, 16^8 space
}

export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });

  const { videoUrl } = await req.json();
  if (!videoUrl) return NextResponse.json({ error: "Missing videoUrl" }, { status: 400 });

  // Validate videoUrl is a real HTTPS URL
  try { const u = new URL(videoUrl); if (u.protocol !== "https:") throw new Error(); } catch {
    return NextResponse.json({ error: "Invalid videoUrl" }, { status: 400 });
  }

  const id = genId();
  const data = JSON.stringify({ videoUrl, count: 0, createdAt: new Date().toISOString() });

  await put(`tracks/${id}.json`, data, {
    access: "public",
    addRandomSuffix: false,
    token,
    contentType: "application/json",
  });

  return NextResponse.json({ id });
}

export async function GET(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  if (!ids.length || !token) return NextResponse.json({ stats: {} });

  const stats: Record<string, number> = {};
  await Promise.all(
    ids.map(async (id) => {
      try {
        const { blobs } = await list({ prefix: `tracks/${id}.json`, token });
        const blob = blobs.find(b => b.pathname === `tracks/${id}.json`);
        if (blob) {
          const res = await fetch(blob.url);
          if (res.ok) {
            const data = await res.json();
            stats[id] = data.count ?? 0;
          }
        }
      } catch { /* ignore */ }
    })
  );

  return NextResponse.json({ stats });
}
