
'use client'

import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Wallet, Calendar, User as UserIcon } from 'lucide-react'
import NextEventCard from '@/app/NextEventCard'
import styles from '@/app/home.module.css'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function HomeDashboard({ session }: { session: any }) {
    const [cachedData, setCachedData] = useState<any>(null)

    // Load initial data from localStorage for immediate display
    useEffect(() => {
        try {
            const saved = localStorage.getItem('home-data')
            if (saved) {
                setCachedData(JSON.parse(saved))
            }
        } catch (e) {
            console.error('Failed to load cache', e)
        }
    }, [])

    const { data, error, isLoading } = useSWR('/api/home-data', fetcher, {
        fallbackData: cachedData,
        onSuccess: (newData) => {
            localStorage.setItem('home-data', JSON.stringify(newData))
        },
        revalidateOnFocus: true,
    })

    // Use data if available (from cache or fetch), otherwise fall back to cachedData state
    const displayData = data || cachedData

    const users = displayData?.users || []
    const nextEvent = displayData?.nextEvent

    // Format dates for NextEventCard
    const formattedEvent = nextEvent ? {
        ...nextEvent,
        startTime: nextEvent.startTime, // Should be string from JSON
        endTime: nextEvent.endTime,
    } : null

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.greeting}>
                    <h1>こんにちは, {session?.displayName || 'Traveler'}! ❄️</h1>
                    <p>冬のイベントを楽しもう！</p>
                </div>
            </header>

            <section className={styles.nextEvent}>
                <h2>次の予定</h2>
                {/* Pass formattedEvent which has string dates, NextEventCard handles it */}
                <NextEventCard nextEvent={formattedEvent} />
            </section>

            <section className={styles.actions}>
                <Link href="/accounting" className={styles.card}>
                    <Wallet size={32} />
                    <span>立替</span>
                </Link>
                <Link href="/itinerary" className={styles.card}>
                    <Calendar size={32} />
                    <span>計画</span>
                </Link>
                {users.map((user: any) => (
                    <Link key={user.id} href={`/location?user=${user.id}`} className={styles.card}>
                        <UserIcon size={32} />
                        <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>{user.displayName}の位置情報</span>
                    </Link>
                ))}
            </section>
        </div>
    )
}
