import { NextRequest, NextResponse } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_PREFIX = "/admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔧 Feature flag: enable / disable admin auth globally
  const adminAuthEnabled =
    process.env.NEXT_PUBLIC_ADMIN_AUTH_ENABLED === "true";

  // 🚧 Auth disabled → allow everything (temporary)
  if (!adminAuthEnabled) {
    return NextResponse.next();
  }

  // Only run middleware for admin routes
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Allow admin login & password reset routes
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password")
  ) {
    return NextResponse.next();
  }

  // Read admin auth cookie
  const adminSession = req.cookies.get("admin_session")?.value;

  // If no admin session → redirect to admin login
  if (!adminSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // ✅ Authenticated admin (coarse check)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
