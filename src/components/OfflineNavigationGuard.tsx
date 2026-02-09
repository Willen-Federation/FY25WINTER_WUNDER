'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * OfflineNavigationGuard
 * 
 * Prevents blank screens when navigating between pages while offline.
 * 
 * How it works:
 * 1. Always tracks the most recently successfully rendered children and pathname
 * 2. When offline and a navigation happens (pathname changes), if children fail
 *    to update (new page's JS chunk couldn't load), shows the previous page
 *    content with an offline banner instead of a blank screen
 * 3. Auto-recovers when connectivity is restored
 */
export default function OfflineNavigationGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isOnline, setIsOnline] = useState(true)
    const [showingStale, setShowingStale] = useState(false)

    // Snapshot of last successfully rendered content
    const lastGoodChildrenRef = useRef<React.ReactNode>(null)
    const lastRenderedPathnameRef = useRef<string>(pathname)
    const pendingNavigationRef = useRef<boolean>(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Track online/offline status
    useEffect(() => {
        const update = () => setIsOnline(navigator.onLine)
        update()

        const handleOnline = () => {
            setIsOnline(true)
            // Re-attempt the failed navigation by reloading
            if (showingStale) {
                window.location.reload()
            }
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [showingStale])

    // When the pathname changes, track that we're in a navigation
    useEffect(() => {
        if (pathname !== lastRenderedPathnameRef.current) {
            pendingNavigationRef.current = true

            // If offline, start a timer. If children don't update in time, show stale.
            if (!navigator.onLine) {
                timerRef.current = setTimeout(() => {
                    if (pendingNavigationRef.current && lastGoodChildrenRef.current) {
                        setShowingStale(true)
                    }
                }, 800)
            }
        }
    }, [pathname])

    // When children change (page render succeeded), update our snapshot
    useEffect(() => {
        if (children != null) {
            lastGoodChildrenRef.current = children
            lastRenderedPathnameRef.current = pathname
            pendingNavigationRef.current = false
            setShowingStale(false)

            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [children, pathname])

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    // If we're showing stale content, render the last good page with a banner
    if (showingStale && lastGoodChildrenRef.current) {
        return (
            <>
                <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '10px 16px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    width: '100%',
                    borderBottom: '1px solid #fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                }}>
                    <span>📡</span>
                    <span>オフラインのため、前の画面を表示中です。接続が回復したら自動で更新されます。</span>
                </div>
                {lastGoodChildrenRef.current}
            </>
        )
    }

    return <>{children}</>
}
