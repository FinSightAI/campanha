import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
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
