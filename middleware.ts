import { NextRequest, NextResponse } from "next/server";

function forbidden() {
  return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

export function middleware(req: NextRequest) {
  // The video proxy is loaded directly by <video src>, which cannot attach a
  // custom header — allow it through (it has its own host allow-list).
  if (req.nextUrl.pathname.startsWith("/api/proxy-video")) return NextResponse.next();

  // CSRF: cost-incurring mutations must originate from our own site. Browsers
  // always send Origin on cross-site POSTs, so a forged cross-origin request
  // is rejected; same-origin requests match the host. (Non-browser clients send
  // no Origin and can't be used for CSRF.)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== (req.headers.get("host") ?? req.nextUrl.host)) return forbidden();
      } catch {
        return forbidden();
      }
    }
  }

  // The @vercel/blob client upload() requests an upload token from /api/upload
  // and cannot attach our custom gate header — skip the static-key gate here
  // (still covered by the CSRF Origin check above + per-IP rate limiting).
  if (req.nextUrl.pathname.startsWith("/api/upload")) return NextResponse.next();

  const expected = process.env.NEXT_PUBLIC_CAMPANHA_KEY;
  if (!expected) return NextResponse.next(); // dev: skip if not set
  const provided = req.headers.get("x-campanha-key");
  if (provided !== expected) {
    return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
