import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.AUTH_SECRET;

  // Retrieve token using next-auth/jwt (lightweight Edge execution)
  const token = await getToken({
    req,
    secret,
    salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
  }).catch(() => null);

  // Fallback lookup with standard salt
  const activeToken =
    token ||
    (await getToken({
      req,
      secret,
    }).catch(() => null));

  const isLoggedIn = !!activeToken;
  const isAdmin = activeToken?.role === "ADMIN";

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
