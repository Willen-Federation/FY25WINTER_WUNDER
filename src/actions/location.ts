'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveLocationAction(lat: number, lng: number) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    try {
        await prisma.locationLog.create({
            data: {
                userId: session.id,
                latitude: lat,
                longitude: lng
            }
        })

        revalidatePath('/location')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to save location' }
    }
}
