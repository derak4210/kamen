import { NextResponse, type NextRequest } from "next/server";

/**
 * HTTP basic auth for the host dashboard. Good enough for one host on HTTPS;
 * swap for Supabase Auth if more people need access.
 */
export function middleware(req: NextRequest) {
  const user = process.env.HOST_USER;
  const password = process.env.HOST_PASSWORD;
  if (!user || !password) {
    return new NextResponse("Dashboard disabled: set HOST_USER and HOST_PASSWORD.", { status: 503 });
  }

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    const sep = decoded.indexOf(":");
    if (sep >= 0 && decoded.slice(0, sep) === user && decoded.slice(sep + 1) === password) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Kamen host"' },
  });
}

export const config = { matcher: ["/dashboard/:path*"] };
