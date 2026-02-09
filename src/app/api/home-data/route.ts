
import { NextResponse } from 'next/server'
import { getCachedUsers, getCachedNextEvent } from '@/lib/data'

export async function GET() {
    const [users, nextEvent] = await Promise.all([
        getCachedUsers(),
        getCachedNextEvent()
    ])
    return NextResponse.json({ users, nextEvent })
}
