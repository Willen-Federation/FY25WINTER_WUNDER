
'use client'

import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import styles from '@/app/itinerary/itinerary.module.css'
import { ItineraryClient } from '@/app/itinerary/ItineraryClient'
import LoadingIndicator from './LoadingIndicator'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ItineraryDashboard() {
    const [cachedData, setCachedData] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('itinerary-data')
                return saved ? JSON.parse(saved) : null
            } catch (e) {
                console.error('Failed to load cache', e)
            }
        }
        return null
    })

    const { data, error } = useSWR('/api/itinerary', fetcher, {
        fallbackData: cachedData,
        onSuccess: (newData) => {
            localStorage.setItem('itinerary-data', JSON.stringify(newData))
        },
        revalidateOnFocus: true
    })

    const displayData = data || cachedData

    if (!displayData) return <LoadingIndicator />

    const { days } = displayData

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>旅の計画 📅</h1>
            <ItineraryClient days={days || []} />
        </div>
    )
}
