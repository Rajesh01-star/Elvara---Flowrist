import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow the admin login page to be accessed publicly
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Admin route protection: inspect Better Auth session cookies
  if (pathname.startsWith("/admin")) {
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      const callbackPath = pathname + (search || "");
      loginUrl.searchParams.set("callbackUrl", callbackPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
