
'use client'

import React, { useState } from 'react'
import useSWR from 'swr'
import styles from '@/app/accounting/accounting.module.css'
import { AccountingClient } from '@/app/accounting/AccountingClient'
import LoadingIndicator from './LoadingIndicator'
import OfflineWarning from './OfflineWarning'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AccountingDashboard() {
    const [cachedData, setCachedData] = useState<any>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('accounting-data')
                return saved ? JSON.parse(saved) : null
            } catch (e) {
                console.error('Failed to load cache', e)
            }
        }
        return null
    })

    const { data, error } = useSWR('/api/accounting', fetcher, {
        fallbackData: cachedData,
        onSuccess: (newData) => {
            localStorage.setItem('accounting-data', JSON.stringify(newData))
        },
        revalidateOnFocus: true
    })

    const displayData = data || cachedData

    if (!displayData) return <LoadingIndicator />

    const { balances, clientUsers, clientExpenses, currentUserIdentity } = displayData

    return (
        <div className={styles.container}>
            {error && <OfflineWarning />}
            <h1 className={styles.header}>会計 & 精算 💰</h1>

            <section className={styles.summaryGrid}>
                {balances?.map((u: any) => (
                    <div key={u.id} className={styles.balanceCard}>
                        <div className={styles.balanceName}>{u.displayName}</div>
                        <div className={`${styles.balanceAmount} ${u.net > 0 ? styles.positive : u.net < 0 ? styles.negative : styles.neutral}`}>
                            {u.net > 0 ? '+' : ''}{u.net.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            {u.net > 0 ? '受取' : u.net < 0 ? '支払' : '精算済'}
                        </div>
                    </div>
                ))}
            </section>

            <AccountingClient
                users={clientUsers || []}
                currentUserIdentity={currentUserIdentity || ''}
                expenses={clientExpenses || []}
            />
        </div>
    )
}
