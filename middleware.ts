import { NextRequest, NextResponse } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_PREFIX = "/admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const adminAuthEnabled = process.env.ADMIN_AUTH_ENABLED === "true";

  // 🚧 Auth disabled → allow everything
  if (!adminAuthEnabled) {
    return NextResponse.next();
  }

  // Only run middleware for admin routes
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Allow auth-related admin routes
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password") ||
    pathname.startsWith("/admin/otp")
  ) {
    return NextResponse.next();
  }

  // Coarse auth check (presence only)
  const adminSession = req.cookies.get("admin_session")?.value;

  if (!adminSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
