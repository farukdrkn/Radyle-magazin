import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protect all /faruk/:path* routes except the root login page /faruk
  if (path.startsWith('/faruk') && path !== '/faruk') {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      const loginUrl = new URL('/faruk', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/faruk/:path*'],
}
