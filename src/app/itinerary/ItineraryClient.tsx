'use client'

import { useState } from 'react'
import styles from './itinerary.module.css'
import { saveItineraryAction } from '@/actions/itinerary'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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

    return (
        <div>
            <div className={styles.tabs}>
                {[1, 2, 3].map(d => (
                    <button
                        key={d}
                        className={cn(styles.tab, activeDay === d && styles.active)}
                        onClick={() => {
                            setActiveDay(d)
                            // Update local markdown from props
                            const dData = days.find(day => day.day === d)
                            setMarkdown(dData?.markdown || '')
                        }}
                    >
                        Day {d}
                    </button>
                ))}
            </div>

            <div className={styles.grid}>
                <div className={cn(styles.editorSection, styles.pcOnly)}>
                    <h3>Editor (Markdown)</h3>
                    <p className={styles.meta}>
                        Format: ## HH:MM [Title]<br />
                        Example: ## 12:00 Lunch
                    </p>
                    <textarea
                        key={activeDay} // Reset content on day switch
                        className={styles.textarea}
                        defaultValue={days.find(d => d.day === activeDay)?.markdown || ''}
                        onChange={(e) => setMarkdown(e.target.value)}
                    // Note: defaultValue used combined with key. onBlur or Button to save.
                    />
                    <button
                        className={styles.saveButton}
                        onClick={() => handleSave(markdown)} // Use current state
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save & Update'}
                    </button>

                    {currentDayData?.lastEditor && (
                        <div className={styles.meta}>
                            Last edited by {currentDayData.lastEditor}
                            {currentDayData.updatedAt && ` at ${format(new Date(currentDayData.updatedAt), 'MM/dd HH:mm')}`}
                        </div>
                    )}
                </div>

                <div className={styles.timeline}>
                    <h3>Timeline</h3>
                    {currentDayData?.items && currentDayData.items.length > 0 ? (
                        currentDayData.items.map((item) => (
                            <div key={item.id} className={styles.timelineItem}>
                                <div className={styles.itemTime}>
                                    {item.startTime ? format(new Date(item.startTime), 'HH:mm') : '??:??'}
                                    {item.endTime ? ` - ${format(new Date(item.endTime), 'HH:mm')}` : ''}
                                </div>
                                <div className={styles.itemTitle}>{item.title}</div>
                                {item.content && <div className={styles.itemContent}>{item.content}</div>}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>No events planned yet.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
