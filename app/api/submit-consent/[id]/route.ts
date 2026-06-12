import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = req.headers.get("x-did-key") || process.env.DID_API_KEY;
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { id } = await params;
  const { name, sourceUrl } = await req.json();

  try { const u = new URL(sourceUrl || ""); if (u.protocol !== "https:") throw new Error(); } catch {
    return Response.json({ error: "Invalid sourceUrl" }, { status: 400 });
  }

  const res = await fetch(`https://api.d-id.com/consents/${id}/video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({ name, source_url: sourceUrl }),
  });

  const data = await res.json();
  if (!res.ok) return Response.json({ error: data.message || "שגיאה" }, { status: res.status });

  return Response.json({ status: data.status });
}
