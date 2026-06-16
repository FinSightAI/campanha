import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip, 3, 60)) return Response.json({ error: "Too many requests" }, { status: 429 });

  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "");
  if (!apiKey) return Response.json({ error: "DID_API_KEY לא מוגדר" }, { status: 500 });

  const { name, consentId, sourceUrl } = await req.json();

  try { const u = new URL(sourceUrl || ""); if (u.protocol !== "https:") throw new Error(); } catch {
    return Response.json({ error: "Invalid sourceUrl" }, { status: 400 });
  }

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
