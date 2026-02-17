import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for SMFLX Frontend
 *
 * Dashboard routes are protected:
 * - Require auth token cookie (smflx_token)
 * - Require active event context cookie (smflx_active_event) for /dashboard* except /dashboard/select-event
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isSelectEvent = pathname === "/dashboard/select-event";

  if (isDashboardRoute) {
    const token = req.cookies.get("smflx_token")?.value;

    // Auth guard: dashboard routes require a token
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("view", "verify");
      return NextResponse.redirect(url);
    }

    // Active event guard: all dashboard routes except select-event must have an active event
    if (!isSelectEvent) {
      const activeEvent = req.cookies.get("smflx_active_event")?.value;
      if (!activeEvent) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard/select-event";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};