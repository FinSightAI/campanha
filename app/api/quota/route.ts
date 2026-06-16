import { NextRequest } from "next/server";
import { checkVideoQuota } from "@/lib/quota";

// Current month's video-generation usage for the caller's D-ID account.
export async function GET(req: NextRequest) {
  const apiKey = (req.headers.get("x-did-key") || process.env.DID_API_KEY || "").replace(/^Basic\s+/i, "");
  if (!apiKey) return Response.json({ error: "Not configured" }, { status: 500 });

  const q = await checkVideoQuota(apiKey);
  return Response.json({
    used: q.used,
    limit: q.limit,
    remaining: Number.isFinite(q.remaining) ? q.remaining : null, // null = unlimited
  });
}
