import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) return NextResponse.redirect(new URL("/", _req.url));

  try {
    const { blobs } = await list({ prefix: `tracks/${id}`, token });
    const blob = blobs[0];
    if (!blob) return NextResponse.redirect(new URL("/", _req.url));

    const data = await fetch(blob.url).then((r) => r.json());
    const videoUrl = data.videoUrl as string;

    // Validate redirect target is a real HTTPS URL
    let parsedUrl: URL;
    try { parsedUrl = new URL(videoUrl); } catch { return NextResponse.redirect(new URL("/", _req.url)); }
    if (!["https:", "http:"].includes(parsedUrl.protocol)) return NextResponse.redirect(new URL("/", _req.url));

    // Increment count asynchronously (best-effort)
    const updated = JSON.stringify({ ...data, count: (data.count ?? 0) + 1 });
    put(`tracks/${id}.json`, updated, {
      access: "public",
      addRandomSuffix: false,
      token,
      contentType: "application/json",
    }).catch(() => {});

    return NextResponse.redirect(parsedUrl.href);
  } catch {
    return NextResponse.redirect(new URL("/", _req.url));
  }
}
