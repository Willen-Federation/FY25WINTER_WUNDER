
import { prisma } from '@/lib/prisma'
import { LocationClient } from './LocationClient'
import { formatDistanceToNow } from 'date-fns'

export default async function LocationPage(
    props: {
        searchParams: Promise<{ user?: string }>
    }
) {
    const searchParams = await props.searchParams
    const users = await prisma.user.findMany({
        select: {
            id: true,
            displayName: true,
            locationLogs: {
                take: 1,
                orderBy: { recordedAt: 'desc' }
            }
        }
    })

    const locations = users
        .filter(u => u.locationLogs.length > 0)
        .map(u => ({
            userId: u.id,
            displayName: u.displayName,
            lat: u.locationLogs[0].latitude,
            lng: u.locationLogs[0].longitude,
            updatedAt: formatDistanceToNow(u.locationLogs[0].recordedAt, { addSuffix: true })
        }))

    let center: [number, number] | undefined
    if (searchParams.user) {
        const target = locations.find(l => l.userId === searchParams.user)
        if (target) {
            center = [target.lat, target.lng]
        }
    }

    return <LocationClient locations={locations} center={center} />
}
