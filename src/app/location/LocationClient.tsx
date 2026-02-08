'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './location.module.css'
import { saveLocationAction } from '@/actions/location'
import { MapPin } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
})

interface Props {
    locations: any[]
}

export function LocationClient({ locations }: Props) {
    const [loading, setLoading] = useState(false)

    const handleManualLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }
        setLoading(true)
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            await saveLocationAction(latitude, longitude)
            setLoading(false)
        }, (err) => {
            console.error(err)
            alert('Failed to get location')
            setLoading(false)
        })
    }

    useEffect(() => {
        // Auto-log on visit if allowed
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                await saveLocationAction(position.coords.latitude, position.coords.longitude)
            }, () => {
                // Ignore errors for auto-log
            })
        }
    }, [])

    return (
        <div className={styles.wrapper}>
            <div className={styles.controls}>
                <button className={styles.btn} onClick={handleManualLocation} disabled={loading}>
                    <MapPin size={20} />
                    {loading ? 'Locating...' : "I'm Here!"}
                </button>
            </div>
            <div className={styles.mapContainer}>
                <Map locations={locations} />
            </div>
        </div>
    )
}
