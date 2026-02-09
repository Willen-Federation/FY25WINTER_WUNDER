'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import styles from './location.module.css'
import { saveLocationAction } from '@/actions/location'
import { MapPin, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

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

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh()
        })
    }

    useEffect(() => {
        const sendLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        await saveLocationAction(position.coords.latitude, position.coords.longitude)
                        console.log('Location auto-updated')
                    } catch (e) {
                        console.error('Failed to save location', e)
                    }
                }, (err) => {
                    console.error('Geo error', err)
                }, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                })
            }
        }

        // Initial call
        sendLocation()

        // Interval 10s
        const interval = setInterval(sendLocation, 10000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className={styles.wrapper}>
            <div className={styles.controls}>
                <button className={cn(styles.btn, styles.secondary)} onClick={handleRefresh} disabled={isPending}>
                    <RotateCw size={20} className={isPending ? "spin" : ""} style={isPending ? { animation: 'spin 1s linear infinite' } : {}} />
                    {isPending ? '更新中...' : '他人の位置を更新'}
                </button>
                <button className={styles.btn} onClick={handleManualLocation} disabled={loading}>
                    <MapPin size={20} />
                    {loading ? '測位中...' : "現在地を更新"}
                </button>
            </div>
            <div className={styles.mapContainer}>
                <Map locations={locations} center={center} />
            </div>
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
