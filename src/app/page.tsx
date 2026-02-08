
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import styles from './home.module.css'
import Link from 'next/link'
import { Wallet, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default async function Home() {
  const session = await getSession()

  const now = new Date()
  const nextEvent = await prisma.itineraryItem.findFirst({
    where: {
      startTime: {
        gte: now
      }
    },
    orderBy: {
      startTime: 'asc'
    }
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>Hello, {session?.displayName || 'Traveler'}! ❄️</h1>
          <p>Ready for the Winter Event?</p>
        </div>
      </header>

      <section className={styles.nextEvent}>
        <h2>Next Schedule</h2>
        {nextEvent ? (
          <div className={styles.eventCard}>
            <div className={styles.time}>
              {nextEvent.startTime ? format(nextEvent.startTime, 'MM/dd HH:mm') : '??:??'}
            </div>
            <div className={styles.title}>{nextEvent.title}</div>
            <div className={styles.desc}>{nextEvent.content || 'No details'}</div>
          </div>
        ) : (
          <div className={styles.eventCard}>
            <div className={styles.time}>--:--</div>
            <div className={styles.title}>No upcoming events</div>
            <div className={styles.desc}>Check the plan to add events!</div>
          </div>
        )}
      </section>

      <section className={styles.actions}>
        <Link href="/accounting" className={styles.card}>
          <Wallet size={32} />
          <span>Pay</span>
        </Link>
        <Link href="/itinerary" className={styles.card}>
          <Calendar size={32} />
          <span>Plan</span>
        </Link>
        <Link href="/location" className={styles.card}>
          <MapPin size={32} />
          <span>Map</span>
        </Link>
      </section>
    </div>
  )
}
