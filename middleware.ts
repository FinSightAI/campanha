import { NextRequest, NextResponse } from "next/server";

function forbidden() {
  return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

const PUBLIC_PATHS = ["/acesso", "/proposta.html", "/guia-gravacao.html", "/pitch", "/v/", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Password gate (app pages only) ───────────────────────────────────────
  const accessPassword = process.env.CAMPANHA_ACCESS_PASSWORD;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (accessPassword && !pathname.startsWith("/api/") && !isPublic) {
    const cookie = req.cookies.get("campanha_access")?.value;
    if (cookie !== accessPassword) {
      const url = req.nextUrl.clone();
      url.pathname = "/acesso";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Proxy — allow through (has its own host allow-list) ──────────────────
  if (pathname.startsWith("/api/proxy-video")) return NextResponse.next();

  // ── CSRF: cost-incurring mutations must come from our own origin ──────────
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

  // ── Blob upload + password login — skip static-key gate ─────────────────
  if (pathname.startsWith("/api/upload") || pathname.startsWith("/api/acesso")) return NextResponse.next();

  // ── Static API key gate (API routes only) ────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const expected = process.env.NEXT_PUBLIC_CAMPANHA_KEY;
    if (expected) {
      const provided = req.headers.get("x-campanha-key");
      if (provided !== expected) {
        return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
