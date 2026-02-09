'use client'

import { useEffect, useState } from 'react'
import { format, intervalToDuration } from 'date-fns'

interface Props {
    startTime: Date
}

export default function NextEventTimer({ startTime }: Props) {
    const [now, setNow] = useState<Date | null>(null)

    useEffect(() => {
        setNow(new Date())
        const timer = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const eventTime = new Date(startTime)
    const timeStr = format(eventTime, 'MM/dd HH:mm')

    if (!now) {
        return (
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                {timeStr} <span style={{ margin: '0 5px', color: '#ccc' }}>|</span> <span style={{ color: '#ef4444' }}>計算中...</span>
            </div>
        )
    }

    const duration = intervalToDuration({
        start: now,
        end: eventTime
    })

    const isPast = now > eventTime

    const parts = []
    if (duration.days && duration.days > 0) parts.push(`${duration.days}日`)
    if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}時間`)
    if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}分`)
    parts.push(`${duration.seconds || 0}秒`)

    const countdownText = isPast ? '終了' : `あと ${parts.join('')}`

    return (
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {timeStr} <span style={{ margin: '0 5px', color: '#ccc' }}>|</span> <span style={{ color: '#ef4444' }}>{countdownText}</span>
        </div>
    )
}
