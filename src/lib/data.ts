
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export const getCachedUsers = unstable_cache(
    async () => prisma.user.findMany({
        select: { id: true, displayName: true }
    }),
    ['users-list'],
    { revalidate: 60, tags: ['users'] }
)

export const getCachedNextEvent = unstable_cache(
    async () => {
        const now = new Date()
        return prisma.itineraryItem.findFirst({
            where: {
                startTime: {
                    gte: now
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        })
    },
    ['next-event'],
    { revalidate: 60, tags: ['itinerary'] }
)
