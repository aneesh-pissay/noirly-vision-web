import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

const protectedPrefixes = [
  "/dashboard",
  "/profile",
  "/vision",
  "/goals",
  "/execution",
  "/focus",
  "/vault",
  "/analytics",
  "/settings",
];

const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isAuthPage(pathname: string) {
  return authPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isLoggedIn = !!token;
  const pathname = request.nextUrl.pathname;

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/vision/:path*",
    "/goals/:path*",
    "/execution/:path*",
    "/focus/:path*",
    "/vault/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
