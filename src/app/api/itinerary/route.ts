
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const daysData = await prisma.itineraryDay.findMany({
        include: { lastEditor: true }
    })

    const itemsData = await prisma.itineraryItem.findMany({
        orderBy: { order: 'asc' }
    })

    // Group items by day
    const itemsByDay: Record<number, any[]> = { 1: [], 2: [], 3: [] }
    itemsData.forEach(item => {
        if (!itemsByDay[item.day]) itemsByDay[item.day] = []
        itemsByDay[item.day].push(item)
    })

    // Map days to specific structure
    const days = [1, 2, 3].map(dayNum => {
        const dayRecord = daysData.find(d => d.day === dayNum)
        return {
            day: dayNum,
            markdown: dayRecord?.markdown || '',
            lastEditor: dayRecord?.lastEditor?.displayName,
            updatedAt: dayRecord?.updatedAt?.toISOString(),
            items: itemsByDay[dayNum]?.map((item: any) => ({
                ...item,
                startTime: item.startTime?.toISOString(),
                endTime: item.endTime?.toISOString(),
            })) || []
        }
    })

    return NextResponse.json({ days })
}
