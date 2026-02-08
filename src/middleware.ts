
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE_NAME } from './lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Exclude static paths and login
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/auth') || // Allow auth API
        pathname === '/login' ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    const cookie = request.cookies.get(SESSION_COOKIE_NAME)
    const token = cookie?.value

    if (!token) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    const payload = await verifyToken(token)
    if (!payload) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
