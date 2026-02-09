'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CacheWarming() {
    const router = useRouter()

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
                        // Prefetch RSC payload (Client -> Server: fetch ?_rsc=...)
                        // This populates the Router Cache AND potentially the SW Cache if the SW intercepts it
                        router.prefetch(route)

                        // Fetch the HTML page explicitly (Client -> Server: full page load request)
                        // This populates the SW Cache due to our updated next.config.ts rule
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
