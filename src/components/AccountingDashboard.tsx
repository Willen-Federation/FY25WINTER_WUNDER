
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

            {displayData.categoryTotals && (
                <section style={{ marginBottom: 20, background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>自己負担内訳 (精算除く)</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal', marginRight: 5 }}>合計:</span>
                            ¥{Object.values(displayData.categoryTotals as Record<string, number>).reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                        </span>
                    </h3>

                    {/* Graph */}
                    <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', marginBottom: 15, background: '#f1f5f9' }}>
                        {(() => {
                            const total = Object.values(displayData.categoryTotals as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                            if (total === 0) return <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />;

                            const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
                            let colorIndex = 0;

                            return Object.entries(displayData.categoryTotals as Record<string, number>)
                                .sort(([, a], [, b]) => b - a)
                                .map(([cat, amount]) => {
                                    const percent = (amount / total) * 100;
                                    const color = COLORS[colorIndex++ % COLORS.length];
                                    return (
                                        <div key={cat} style={{ width: `${percent}%`, height: '100%', background: color }} title={`${cat}: ¥${(amount as number).toLocaleString()}`} />
                                    );
                                });
                        })()}
                    </div>

                    {/* Legend / List */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {(() => {
                            const total = Object.values(displayData.categoryTotals as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                            const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
                            let colorIndex = 0;

                            return Object.entries(displayData.categoryTotals as Record<string, number>)
                                .sort(([, a], [, b]) => b - a)
                                .map(([cat, amount]) => {
                                    const color = COLORS[colorIndex++ % COLORS.length];
                                    return (
                                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 10px', borderRadius: 20, border: '1px solid #f1f5f9' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}></div>
                                            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{cat}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>¥{amount.toLocaleString()}</span>
                                        </div>
                                    );
                                });
                        })()}
                        {Object.keys(displayData.categoryTotals).length === 0 && <span style={{ color: '#999', fontSize: '0.9rem' }}>データなし</span>}
                    </div>
                </section>
            )}

            <AccountingClient
                users={clientUsers || []}
                currentUserIdentity={currentUserIdentity || ''}
                expenses={clientExpenses || []}
            />
        </div>
    )
}
