'use client'

import React, { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isOnline, setIsOnline] = React.useState(true)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            // Auto-reset when back online
            reset()
        }
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [reset])

    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                {isOnline ? '⚠️' : '📡'}
            </div>
            <h2 style={{
                color: 'var(--primary, #2a5298)',
                marginBottom: '12px',
                fontSize: '1.4rem',
            }}>
                {isOnline ? 'エラーが発生しました' : 'オフラインです'}
            </h2>
            <p style={{
                color: 'var(--text-secondary, #5a6a85)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '24px',
            }}>
                {isOnline
                    ? 'ページの読み込みに失敗しました。'
                    : 'このページを表示するにはインターネット接続が必要です。接続が回復したら自動的に再読み込みします。'
                }
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '12px 32px',
                    background: 'var(--primary, #2a5298)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'opacity 0.2s',
                }}
            >
                再読み込み
            </button>
        </div>
    )
}
