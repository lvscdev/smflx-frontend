import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for SMFLX Frontend
 * 
 * Admin routes removed - handled by separate admin frontend
 * This middleware is minimal and can be extended for future needs
 */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Router-level guard: dashboard must always have an active event context.
  // We persist this server-side via cookie (set when user selects an event).
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isSelectEvent = pathname === "/dashboard/select-event";

  if (isDashboardRoute && !isSelectEvent) {
    const activeEvent = req.cookies.get("smflx_active_event")?.value;

    if (!activeEvent) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/select-event";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}


export const config = {
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
