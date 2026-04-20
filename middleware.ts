import { NextResponse, type NextRequest } from "next/server";
import { isAdminFromHeader } from "./lib/auth";

// Gate all non-GET /api/* routes (except /api/login) behind admin cookie.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  const isApi = pathname.startsWith("/api/");
  const isLogin = pathname.startsWith("/api/login") || pathname.startsWith("/api/logout");
  const isMutation = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  if (isApi && isMutation && !isLogin) {
    if (!(await isAdminFromHeader(req.headers.get("cookie")))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
