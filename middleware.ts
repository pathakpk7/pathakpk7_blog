import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.AUTH_SECRET;

  // Read JWT token (works across development and production Vercel cookies)
  const token = await getToken({
    req,
    secret,
  });

  const isLoggedIn = !!token;
  const isAdmin = token?.role === "ADMIN";

  // Protect /studio routes -> Admin only
  if (pathname.startsWith("/studio")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect /library and /settings -> Authenticated users only
  if (pathname.startsWith("/library") || pathname.startsWith("/settings")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/library/:path*", "/settings/:path*"],
};
