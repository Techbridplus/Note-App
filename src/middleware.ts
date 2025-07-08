import { NextResponse, NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req
  
  // Get token without using the full auth middleware
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token
  // Redirect authenticated users away from auth pages
  if (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") {
    console.log("path /login or /signup")
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  // Protect all other routes except auth pages
  if (!isLoggedIn) {
    console.log("redirecting to login")
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
