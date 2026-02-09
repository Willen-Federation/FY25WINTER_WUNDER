'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/Modal' // This path assumes aliases are working, otherwise relative
// import { Modal } from '../components/Modal'
import { format } from 'date-fns'
import styles from './home.module.css'
import NextEventTimer from './NextEventTimer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Event {
    id: string
    title: string
    content: string | null
    startTime: string | Date | null // Allow string
    endTime: string | Date | null   // Allow string
}

export default function NextEventCard({ nextEvent }: { nextEvent: Event | null }) {
    const [isOpen, setIsOpen] = useState(false)

    if (!nextEvent) {
        return (
            <div className={styles.eventCard}>
                <div className={styles.title}>予定なし</div>
                <div className={styles.desc}>プランを確認して予定を追加しましょう！</div>
            </div>
        )
    }

    const startDate = nextEvent.startTime ? new Date(nextEvent.startTime) : null
    const endDate = nextEvent.endTime ? new Date(nextEvent.endTime) : null

    return (
        <>
            <div
                className={styles.eventCard}
                onClick={() => setIsOpen(true)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '5px solid #3b82f6' }}
            >
                {startDate && <NextEventTimer key={startDate.getTime()} startTime={startDate} />}
                <div className={styles.title}>{nextEvent.title}</div>
                <div className={styles.desc}>
                    {nextEvent.content ? (nextEvent.content.length > 50 ? nextEvent.content.substring(0, 50) + '...' : nextEvent.content) : '詳細なし'}
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="予定の詳細">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>日時</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                            {startDate ? format(startDate, 'MM/dd HH:mm') : '未定'}
                            {endDate ? ` - ${format(endDate, 'HH:mm')}` : ''}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>タイトル</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{nextEvent.title}</div>
                    </div>
                    {nextEvent.content && (
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>詳細</div>
                            <div style={{ lineHeight: 1.5, fontSize: '0.95rem' }} className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {nextEvent.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    )
}
