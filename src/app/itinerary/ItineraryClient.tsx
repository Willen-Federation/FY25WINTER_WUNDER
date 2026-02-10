'use client'

import { useState } from 'react'
import styles from './itinerary.module.css'
import { saveItineraryAction } from '@/actions/itinerary'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Printer } from 'lucide-react'

interface ItineraryItemProps {
    id: string
    day: number
    startTime: string | null
    endTime: string | null
    title: string
    content: string | null
    order: number
}

interface DayData {
    day: number
    markdown: string
    lastEditor?: string
    updatedAt?: string
    items: ItineraryItemProps[]
}

interface Props {
    days: DayData[]
}

export function ItineraryClient({ days }: Props) {
    const [activeDay, setActiveDay] = useState(1)
    const currentDayData = days.find(d => d.day === activeDay)

    const [markdown, setMarkdown] = useState(currentDayData?.markdown || '')

    // Sync state when switching days
    // But wait, if we switch days, 'markdown' state holds the OLD day's markdown if we don't reset it?
    // We should key the textarea on activeDay OR use useEffect.
    // Using key is cleaner.

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async (md: string) => {
        setIsSaving(true)
        await saveItineraryAction(activeDay, md)
        setIsSaving(false)
    }

    const [selectedItem, setSelectedItem] = useState<ItineraryItemProps | null>(null)



    return (
        <div>
            <div className="print-hide" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 30 }}>
                <div className={styles.tabs} style={{ marginBottom: 0 }}>
                    {[1, 2, 3].map(d => (
                        <button
                            key={d}
                            className={cn(styles.tab, activeDay === d && styles.active)}
                            onClick={() => {
                                setActiveDay(d)
                                const dData = days.find(day => day.day === d)
                                setMarkdown(dData?.markdown || '')
                            }}
                        >
                            Day {d}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => window.print()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 20, border: 'none',
                        background: '#333', color: 'white', cursor: 'pointer', fontWeight: 'bold'
                    }}
                    className="print-hide"
                >
                    <Printer size={18} />
                    PDF出力
                </button>
            </div>

            <div className={styles.grid}>
                <div className={cn(styles.editorSection, styles.pcOnly)}>
                    <h3>エディタ (Markdown)</h3>
                    <p className={styles.meta}>
                        記述形式: ## HH:MM [タイトル]<br />
                        例: ## 12:00 ランチ
                    </p>
                    <textarea
                        key={activeDay}
                        className={styles.textarea}
                        defaultValue={days.find(d => d.day === activeDay)?.markdown || ''}
                        onChange={(e) => setMarkdown(e.target.value)}
                    />
                    <button
                        className={styles.saveButton}
                        onClick={() => handleSave(markdown)}
                        disabled={isSaving}
                    >
                        {isSaving ? '保存中...' : '保存 & 更新'}
                    </button>
                    {currentDayData?.lastEditor && (
                        <div className={styles.meta}>
                            最終更新者: {currentDayData.lastEditor}
                            {currentDayData.updatedAt && ` (${format(new Date(currentDayData.updatedAt), 'MM/dd HH:mm')})`}
                        </div>
                    )}
                </div>

                <div className={styles.timeline}>
                    <h3>タイムライン (Day {activeDay})</h3>
                    {currentDayData?.items && currentDayData.items.length > 0 ? (
                        currentDayData.items.map((item) => (
                            <div key={item.id} className={styles.timelineItem} onClick={() => setSelectedItem(item)} style={{ cursor: 'pointer' }}>
                                <div className={styles.itemTime}>
                                    {item.startTime ? format(new Date(item.startTime), 'HH:mm') : '??:??'}
                                    {item.endTime ? ` - ${format(new Date(item.endTime), 'HH:mm')}` : ''}
                                </div>
                                <div className={styles.itemTitle}>{item.title}</div>
                                {/* Hidden Content for Print */}
                                <div className="print-content" style={{ display: 'none' }}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} style={{ color: '#333', textDecoration: 'underline' }} />
                                        }}
                                    >
                                        {item.content || ''}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>まだ予定がありません。</div>
                    )}
                </div>
            </div>

            {selectedItem && (
                <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                            <h3 style={{ margin: 0, color: 'var(--primary)' }}>{selectedItem.title}</h3>
                            <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: 15, fontWeight: 'bold', color: '#666' }}>
                            {selectedItem.startTime ? format(new Date(selectedItem.startTime), 'HH:mm') : '??:??'}
                            {selectedItem.endTime ? ` - ${format(new Date(selectedItem.endTime), 'HH:mm')}` : ''}
                        </div>

                        <div className={styles.itemContent} style={{ display: 'block', maxHeight: '60vh', overflowY: 'auto' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }} />
                                }}
                            >
                                {selectedItem.content || ''}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    /* Hide specific elements */
                    .${styles.editorSection}, 
                    .${styles.tabs}, 
                    .print-hide, 
                    .${styles.modalOverlay} {
                        display: none !important;
                    }

                    /* Layout adjustments */
                    body {
                        background: white;
                    }
                    
                    /* Expand timeline */
                    .${styles.grid} {
                        display: block !important;
                    }
                    .${styles.timeline} {
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* Show content */
                    .print-content {
                        display: block !important;
                        margin-top: 12px;
                        padding-top: 8px;
                        border-top: 1px  dashed #ddd;
                        color: #333;
                        font-size: 0.9rem;
                    }

                    /* Improve typography for print */
                    .print-content p {
                        margin-bottom: 6px;
                    }
                    .print-content ul {
                        margin-left: 1.2em;
                    }

                    /* Ensure background graphics (like timeline dots) are printed if possible, 
                       though standard browser settings usually disable background colors.
                       We try to enforce simple styles. 
                    */
                    .${styles.timelineItem} {
                        break-inside: avoid;
                        border-left-color: #ccc !important;
                        padding-left: 15px !important;
                        margin-bottom: 20px !important;
                    }
                    /* Add print-friendly text color */
                    * {
                        color: #000 !important;
                    }
                }
            `}</style>
        </div>
    )
}
