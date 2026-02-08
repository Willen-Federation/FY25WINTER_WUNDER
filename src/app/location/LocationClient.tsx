'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './location.module.css'
import { saveLocationAction } from '@/actions/location'
import { MapPin } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>読み込み中...</div>
})

interface Props {
    locations: any[]
    center?: [number, number]
}

export function LocationClient({ locations, center }: Props) {
    const [loading, setLoading] = useState(false)

    const handleManualLocation = () => {
        if (!navigator.geolocation) {
            alert('お使いのブラウザは位置情報をサポートしていません')
            return
        }
        setLoading(true)
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            await saveLocationAction(latitude, longitude)
            setLoading(false)
        }, (err) => {
            console.error(err)
            alert('位置情報の取得に失敗しました')
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
                    {loading ? '測位中...' : "現在地を更新"}
                </button>
            </div>
            <div className={styles.mapContainer}>
                <Map locations={locations} center={center} />
            </div>
        </div>
    )
}
