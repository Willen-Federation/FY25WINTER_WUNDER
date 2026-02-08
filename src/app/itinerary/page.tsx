
import { prisma } from '@/lib/prisma'
import { ItineraryClient } from './ItineraryClient' // I will create this
import styles from './itinerary.module.css' // And this

export default async function ItineraryPage() {
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

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>旅の計画 📅</h1>
            <ItineraryClient days={days} />
        </div>
    )
}
