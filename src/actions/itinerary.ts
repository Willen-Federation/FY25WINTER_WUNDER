'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { parseItineraryMarkdown } from '@/lib/itinerary'
import { revalidatePath } from 'next/cache'

export async function saveItineraryAction(day: number, markdown: string) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const parsedItems = parseItineraryMarkdown(markdown, day)

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Upsert ItineraryDay
            await tx.itineraryDay.upsert({
                where: { day },
                update: {
                    markdown,
                    lastEditorId: session.id,
                },
                create: {
                    day,
                    markdown,
                    lastEditorId: session.id,
                }
            })

            // 2. Delete existing items for this day
            await tx.itineraryItem.deleteMany({
                where: { day }
            })

            // 3. Create new items
            if (parsedItems.length > 0) {
                await tx.itineraryItem.createMany({
                    data: parsedItems.map((item, index) => ({
                        day,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        title: item.title,
                        content: item.content,
                        order: index
                    }))
                })
            }
        })

        revalidatePath('/itinerary')
        revalidatePath('/')
        return { success: true }
    } catch (err) {
        console.error(err)
        return { error: 'Failed to save' }
    }
}
