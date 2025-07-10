import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [ "/signin", "/signup"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    null;

  if (!token && !publicRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if(token && publicRoutes.includes(path)){
    return NextResponse.redirect(new URL("/",request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
