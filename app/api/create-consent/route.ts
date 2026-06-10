import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-did-key") || process.env.DID_API_KEY;
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { language } = await req.json();

  const res = await fetch("https://api.d-id.com/consents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({ language: language || "hebrew" }),
  });

  const data = await res.json();
  if (!res.ok) return Response.json({ error: data.message || "שגיאה" }, { status: res.status });

  return Response.json({ id: data.id, text: data.text });
}
