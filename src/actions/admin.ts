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

export async function clearLocationsAction() {
    await checkAdmin()
    await prisma.locationLog.deleteMany()
    revalidatePath('/admin')
    revalidatePath('/location')
}
