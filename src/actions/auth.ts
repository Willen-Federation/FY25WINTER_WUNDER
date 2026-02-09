'use server'

import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken, SESSION_COOKIE_NAME } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return { error: 'ID and Password are required.' }
    }

    let step = 'init'
    try {
        step = 'db_lookup'
        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return { error: 'Invalid credentials. (User not found)' }
        }

        step = 'password_verify'
        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
            console.error('Password mismatch.')
            return { error: 'Invalid credentials. (Password mismatch)' }
        }

        step = 'token_sign'
        const token = await signToken({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
        })

        step = 'cookie_get'
        const cookieStore = await cookies()
        const targetDate = new Date('2026-03-31T23:59:59+09:00')

        step = 'cookie_set'
        cookieStore.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: targetDate,
            sameSite: 'lax',
            path: '/',
        })
    } catch (error) {
        console.error(`Login error at step [${step}]:`, error)
        if (error instanceof Error) {
            return { error: `Error at ${step}: ${error.message}` }
        }
        return { error: `Something went wrong at ${step}.` }
    }

    redirect('/')
}
