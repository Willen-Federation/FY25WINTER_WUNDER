'use client'

import { useEffect } from 'react'

export default function CacheWarming() {
    useEffect(() => {
        // Only run if service worker is active (or compatible)
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const warmCache = async () => {
                const routes = [
                    '/accounting',
                    '/itinerary',
                    '/location',
                    '/'
                ]

                console.log('WinterWunder: Warming cache for offline access...')

                for (const route of routes) {
                    try {
                        // Fetch the HTML page
                        // priority: 'low' is a hint to the browser to not block critical resources
                        // @ts-ignore - priority is valid in modern browsers
                        await fetch(route, { priority: 'low' })
                    } catch (e) {
                        // Ignore errors (e.g. if already offline)
                        console.debug(`Failed to warm cache for ${route}`, e)
                    }
                }
            }

            // Delay slightly to not impact initial load
            const timer = setTimeout(() => {
                requestIdleCallback ? requestIdleCallback(warmCache) : setTimeout(warmCache, 2000)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [])

    return null
}
