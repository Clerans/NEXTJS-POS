import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/api/auth/login",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static files and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Allow explicitly public routes
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    // If user is already logged in and visits /login, redirect to /dashboard
    const sessionCookie = request.cookies.get("nexuspos_session");
    if (sessionCookie && (pathname === "/login" || pathname === "/forgot-password")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Check for session cookie on protected routes
  const sessionCookie = request.cookies.get("nexuspos_session");
  if (!sessionCookie || !sessionCookie.value) {
    // For API routes, return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required to access this resource.",
          },
        },
        { status: 401 }
      );
    }

    // For UI pages, redirect to /login with redirect parameter
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. In a production deployment, lightweight JWT header inspection or forward
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
