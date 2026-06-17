import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "").replace(/\s+/g, "");
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { id } = await params;

  const res = await fetch(`https://api.d-id.com/scenes/avatars/${id}`, {
    headers: { Authorization: `Basic ${apiKey}` },
  });

  const data = await res.json();
  if (!res.ok) return Response.json({ error: data.message || "שגיאה" }, { status: res.status });

  return Response.json({
    status: data.status,
    voiceId: data.voice_id ?? null,
    thumbnailUrl: data.thumbnail_url ?? null,
  });
}
