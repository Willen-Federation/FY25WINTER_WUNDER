'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }
}

export async function deleteExpenseAction(id: string) {
    await checkAdmin()
    await prisma.expense.delete({ where: { id } })
    revalidatePath('/admin')
    revalidatePath('/accounting')
}

export async function clearItineraryAction(day: number) {
    await checkAdmin()
    await prisma.itineraryDay.delete({ where: { day } })
    await prisma.itineraryItem.deleteMany({ where: { day } })
    revalidatePath('/admin')
    revalidatePath('/itinerary')
}

import { hash } from 'bcryptjs'

export async function clearLocationsAction() {
    await checkAdmin()
    await prisma.locationLog.deleteMany()
    revalidatePath('/admin')
    revalidatePath('/location')
}

export async function createUserAction(formData: FormData) {
    await checkAdmin()
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string
    const role = formData.get('role') as string || 'USER'

    if (!username || !password || !displayName) {
        return { success: false, error: 'Missing fields' }
    }

    const passwordHash = await hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                username,
                passwordHash,
                displayName,
                role
            }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to create user (username might be taken)' }
    }
}

export async function getAdminUsers() {
    await checkAdmin()
    return prisma.user.findMany({
        orderBy: { displayName: 'asc' },
        select: { id: true, displayName: true, username: true, role: true }
    })
}

export async function updateUserAction(formData: FormData) {
    const session = await getSession()
    if (!session) {
        throw new Error('Unauthorized')
    }

    const id = formData.get('id') as string
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string
    const submitRole = formData.get('role') as string

    if (!id || !username || !displayName) {
        return { success: false, error: 'Missing fields' }
    }

    // Permission check: Admin can update anyone, User can only update self
    if (session.role !== 'ADMIN' && session.id !== id) {
        throw new Error('Unauthorized: You can only edit your own profile')
    }

    const data: any = {
        username,
        displayName,
    }

    // Only Admin can update role
    if (session.role === 'ADMIN' && submitRole) {
        data.role = submitRole
    }

    if (password && password.trim() !== '') {
        data.passwordHash = await hash(password, 10)
    }

    try {
        await prisma.user.update({
            where: { id },
            data
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to update user' }
    }
}

export async function deleteUserAction(userId: string) {
    await checkAdmin()
    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath('/admin')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Failed to delete user' }
    }
}
