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

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return { error: 'Invalid credentials.' }
        }

        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
            return { error: 'Invalid credentials.' }
        }

        const token = await signToken({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
        })

        const cookieStore = await cookies()
        const targetDate = new Date('2026-03-31T23:59:59+09:00')

        cookieStore.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: targetDate,
            sameSite: 'lax',
            path: '/',
        })
    } catch (error) {
        console.error(error)
        return { error: 'Something went wrong.' }
    }

    redirect('/')
}
