
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE_NAME } from './lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Exclude static paths and public assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/') || // Use specific API Auth check if needed, but generic /api is usually fine for now
        pathname === '/favicon.ico' ||
        pathname === '/manifest.webmanifest' ||
        pathname === '/sw.js' ||
        pathname.startsWith('/workbox-')
    ) {
        return NextResponse.next()
    }

    const cookie = request.cookies.get(SESSION_COOKIE_NAME)
    const token = cookie?.value
    const payload = token ? await verifyToken(token) : null

    // 2. Login Page Logic: Redirect to Home if already authenticated
    if (pathname === '/login') {
        if (payload) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // 3. Protected Routes Logic: Redirect to Login if unauthenticated
    if (!payload && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
