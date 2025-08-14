// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("access_token");
  if (token && request.nextUrl.pathname.startsWith("/signin")) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }
  if (!token && request.nextUrl.pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/signin", "/signup", "/profile/:path*", "/admin/:path*"],
};