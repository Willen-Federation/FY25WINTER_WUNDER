
'use client'
import React from 'react'

export default function OfflineWarning() {
    return (
        <div style={{
            backgroundColor: '#fee2e2', // red-100
            color: '#b91c1c', // red-700
            padding: '10px',
            textAlign: 'center',
            fontSize: '0.9rem',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            width: '100%',
            marginBottom: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            ネットワークエラーにより最新のデータを取得できません。再接続を試みております...
        </div>
    )
}
