import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-did-key") || process.env.DID_API_KEY;
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { name, consentId, sourceUrl } = await req.json();

  const res = await fetch("https://api.d-id.com/scenes/avatars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      name,
      consent_id: consentId,
      source_url: sourceUrl,
      persist: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) return Response.json({ error: data.message || "שגיאה" }, { status: res.status });

  return Response.json({ id: data.id, status: data.status });
}
