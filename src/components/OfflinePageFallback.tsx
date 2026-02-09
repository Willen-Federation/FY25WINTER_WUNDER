'use client'

import React from 'react'

interface OfflinePageFallbackProps {
    pageName?: string
}

export default function OfflinePageFallback({ pageName }: OfflinePageFallbackProps) {
    return (
        <div style={{
            padding: '40px 20px',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '4rem',
                marginBottom: '20px',
            }}>
                📡
            </div>
            <h2 style={{
                color: 'var(--primary)',
                marginBottom: '12px',
                fontSize: '1.4rem',
            }}>
                オフラインです
            </h2>
            <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '24px',
            }}>
                {pageName
                    ? `「${pageName}」を表示するにはインターネット接続が必要です。`
                    : 'このページを表示するにはインターネット接続が必要です。'}
                <br />
                接続が回復したら自動的に再読み込みします。
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '12px 32px',
                    background: 'var(--primary)',
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
