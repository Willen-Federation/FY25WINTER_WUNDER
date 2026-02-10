import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { userId } = await params

  const locationLogs = await prisma.locationLog.findMany({
    where: { userId },
    orderBy: { recordedAt: 'asc' }
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true }
  })

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="FY25WINTER_WUNDER" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${user?.displayName || 'User'} Location History</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${user?.displayName || 'User'} Track</name>
    <trkseg>
      ${locationLogs.map(log => `
      <trkpt lat="${log.latitude}" lon="${log.longitude}">
        <time>${log.recordedAt.toISOString()}</time>
      </trkpt>`).join('')}
    </trkseg>
  </trk>
</gpx>`

  return new NextResponse(gpxContent, {
    headers: {
      'Content-Type': 'application/gpx+xml',
      'Content-Disposition': `attachment; filename="location_history_${userId}.gpx"`
    }
  })
}
