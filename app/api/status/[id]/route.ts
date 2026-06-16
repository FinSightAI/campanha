import type { NextRequest } from "next/server";
import { put, list } from "@vercel/blob";

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
  if (!res.ok) {
    console.error("[status]", res.status, data?.message);
    return Response.json({ error: "Erro ao consultar o status. Tente novamente." }, { status: res.status });
  }

  if (data.status === "done" && data.result_url) {
    try {
      // Idempotent: if already archived (deterministic path), reuse it instead of
      // re-fetching/re-uploading on every poll (which created orphaned dup blobs).
      const { blobs } = await list({ prefix: `videos/${id}` });
      const existing = blobs.find((b) => b.pathname === `videos/${id}.mp4` || b.pathname === `videos/${id}.webm`);
      if (existing) return Response.json({ status: "done", result_url: existing.url });

      const vid = await fetch(data.result_url, { signal: AbortSignal.timeout(40000) });
      const contentType = vid.headers.get("content-type") || "video/mp4";
      const ext = contentType.includes("webm") ? "webm" : "mp4";
      const buffer = await vid.arrayBuffer();
      // Deterministic path so a re-poll overwrites the same object and the URL is stable.
      const { url } = await put(`videos/${id}.${ext}`, buffer, { access: "public", addRandomSuffix: false, contentType });
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
