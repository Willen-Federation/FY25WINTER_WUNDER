
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'development_secret_key_winter_2026'
const key = new TextEncoder().encode(SECRET_KEY)

export const SESSION_COOKIE_NAME = 'winter_session'

export async function signToken(payload: any) {
    // Expires: 2026/03/31 23:59:59 JST
    const targetDate = new Date('2026-03-31T23:59:59+09:00')
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(targetDate.getTime() / 1000))
        .sign(key)
}

export interface SessionUser {
    id: string
    username: string
    displayName: string
    role: string
    iat?: number
    exp?: number
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        return payload as unknown as SessionUser
    } catch (err) {
        return null
    }
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE_NAME)
    if (!session) return null
    return await verifyToken(session.value)
}
