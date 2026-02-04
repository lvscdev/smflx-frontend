import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for SMFLX Frontend
 * 
 * Admin routes removed - handled by separate admin frontend
 * This middleware is minimal and can be extended for future needs
 */

export function middleware(req: NextRequest) {
  // Currently no middleware logic needed for front-office routes
  // Can add rate limiting, analytics, etc. here in the future
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
