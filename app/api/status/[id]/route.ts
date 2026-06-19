import type { NextRequest } from "next/server";
import { put, list } from "@vercel/blob";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── HeyGen status — IDs are prefixed "heygen_" ────────────────────────────
  if (id.startsWith("heygen_")) {
    const heygenKey = process.env.HEYGEN_API_KEY;
    if (!heygenKey) return Response.json({ error: "Serviço não configurado." }, { status: 500 });

    const videoId = id.slice("heygen_".length);

    try {
      const res = await fetch(
        `https://api.heygen.com/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
        { headers: { "X-Api-Key": heygenKey }, cache: "no-store" }
      );

      if (!res.ok) {
        console.error("[heygen status]", res.status);
        return Response.json({ status: "processing" });
      }

      const data = await res.json();
      const st: string = data?.data?.status ?? "processing";

      if (st === "completed") {
        const resultUrl = data.data.video_url as string;

        // Archive to Blob for stable URL (same pattern as D-ID).
        try {
          const blobPath = `videos/${id}.mp4`;
          const { blobs } = await list({ prefix: blobPath });
          const existing = blobs.find((b) => b.pathname === blobPath);
          if (existing) return Response.json({ status: "done", result_url: existing.url });

          const vid = await fetch(resultUrl, { signal: AbortSignal.timeout(40000) });
          const buffer = await vid.arrayBuffer();
          const { url } = await put(blobPath, buffer, {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: "video/mp4",
          });
          return Response.json({ status: "done", result_url: url });
        } catch {
          // Non-fatal — serve HeyGen URL directly if archival fails.
          return Response.json({ status: "done", result_url: resultUrl });
        }
      }

      if (st === "failed") {
        return Response.json({ status: "error", error: "Geração falhou." });
      }

      return Response.json({ status: "processing" });
    } catch {
      return Response.json({ status: "processing" });
    }
  }

  // ── D-ID status (default) ─────────────────────────────────────────────────
  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "").replace(/\s+/g, "");
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

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
      const { url } = await put(`videos/${id}.${ext}`, buffer, { access: "public", addRandomSuffix: false, allowOverwrite: true, contentType });
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
