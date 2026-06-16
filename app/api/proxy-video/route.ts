import { NextRequest } from "next/server";

// Same-origin streaming proxy for video files so the client <video> element is
// CORS-clean (Vercel Blob / D-ID don't send Access-Control-Allow-Origin, which
// breaks crossOrigin="anonymous" playback and captureStream() in the trimmer).
// Host allow-list also prevents this route being used for SSRF.
const ALLOWED_HOSTS = [
  /\.blob\.vercel-storage\.com$/,
  /(^|\.)d-id\.com$/,
];

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) return new Response("Missing url", { status: 400 });

  let u: URL;
  try {
    u = new URL(target);
  } catch {
    return new Response("Bad url", { status: 400 });
  }

  if (u.protocol !== "https:" || !ALLOWED_HOSTS.some((re) => re.test(u.hostname))) {
    return new Response("Forbidden host", { status: 403 });
  }

  const upstream = await fetch(u.href, { redirect: "follow" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
      "Cache-Control": "private, max-age=300",
    },
  });
}
