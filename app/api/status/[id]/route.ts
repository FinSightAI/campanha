import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "");
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { id } = await params;

  const res = await fetch(`https://api.d-id.com/scenes/${id}`, {
    headers: { Authorization: `Basic ${apiKey}` },
  });

  const data = await res.json();
  if (!res.ok) return Response.json({ error: data.message || "שגיאה" }, { status: res.status });

  if (data.status === "done" && data.result_url) {
    // Already archived to Blob on a previous poll
    if (data.result_url.includes("blob.vercel-storage.com")) {
      return Response.json({ status: "done", result_url: data.result_url });
    }
    try {
      const vid = await fetch(data.result_url, { signal: AbortSignal.timeout(40000) });
      const contentType = vid.headers.get("content-type") || "video/mp4";
      const ext = contentType.includes("webm") ? "webm" : "mp4";
      const buffer = await vid.arrayBuffer();
      const { url } = await put(`videos/${id}.${ext}`, buffer, { access: "public", contentType });
      return Response.json({ status: "done", result_url: url });
    } catch {
      // Fall back to D-ID URL if archival fails
      return Response.json({ status: "done", result_url: data.result_url });
    }
  }

  return Response.json({
    status: data.status,
    result_url: data.result_url ?? null,
  });
}
