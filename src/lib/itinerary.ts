
import { addDays, parse, set } from 'date-fns'

const TRIP_START_DATE = process.env.TRIP_START_DATE || '2026-02-14'

export interface ParsedItem {
    startTime: Date | null
    endTime: Date | null
    title: string
    content: string
}

export function getTripDate(day: number): Date {
    // Day 1 = Start Date (0 days added)
    // Day 2 = Start Date + 1
    const start = new Date(TRIP_START_DATE)
    return addDays(start, day - 1)
}

export function parseItineraryMarkdown(markdown: string, day: number): ParsedItem[] {
    const lines = markdown.split('\n')
    const items: ParsedItem[] = []

    let currentItem: ParsedItem | null = null

    // Regex for "## HH:MM Title" or "## HH:MM-HH:MM Title"
    // Supports:
    // ## 12:00 Lunch
    // ## 12:00-13:00 Lunch
    const timeRegex = /^##\s+(\d{1,2}:\d{2})(?:-(\d{1,2}:\d{2}))?\s+(.*)$/

    const baseDate = getTripDate(day)

    for (const line of lines) {
        const match = line.match(timeRegex)
        if (match) {
            // Save previous item
            if (currentItem) {
                currentItem.content = currentItem.content.trim()
                items.push(currentItem)
            }

            const [_, startStr, endStr, title] = match

            // Parse dates
            const startDate = parse(startStr, 'HH:mm', baseDate)
            let endDate: Date | null = null

            if (endStr) {
                endDate = parse(endStr, 'HH:mm', baseDate)
            }

            currentItem = {
                startTime: startDate,
                endTime: endDate,
                title: title.trim(),
                content: ''
            }
        } else {
            if (currentItem) {
                currentItem.content += line + '\n'
            }
        }
    }

    // Push last item
    if (currentItem) {
        currentItem.content = currentItem.content.trim()
        items.push(currentItem)
    }

    return items
}
