import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await getSession()
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            displayName: true,
            locationLogs: {
                orderBy: { recordedAt: 'asc' }
            }
        }
    })

    const tracks = users
        .filter(u => u.locationLogs.length > 0)
        .map(u => `
  <trk>
    <name>${u.displayName}</name>
    <trkseg>${u.locationLogs.map(log => `
      <trkpt lat="${log.latitude}" lon="${log.longitude}">
        <time>${log.recordedAt.toISOString()}</time>
      </trkpt>`).join('')}
    </trkseg>
  </trk>`).join('')

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FY25WINTER_WUNDER" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>All Users Location History</name>
    <time>${new Date().toISOString()}</time>
  </metadata>${tracks}
</gpx>`

    return new NextResponse(gpxContent, {
        headers: {
            'Content-Type': 'application/gpx+xml',
            'Content-Disposition': `attachment; filename="all_location_history.gpx"`
        }
    })
}
