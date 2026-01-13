import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isProtected =
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/api/admin");

  if (!isProtected) return NextResponse.next();

  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASS || "admin";

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const base64 = auth.split(" ")[1];
  const [u, p] = Buffer.from(base64, "base64").toString().split(":");

  if (u !== user || p !== pass) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
