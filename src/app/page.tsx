
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import styles from './home.module.css'
import Link from 'next/link'
import { Wallet, Calendar, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import NextEventCard from './NextEventCard'

export default async function Home() {
  const session = await getSession()
  const users = await prisma.user.findMany({
    select: { id: true, displayName: true }
  })

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

  // Format dates for Client Component
  const formattedEvent = nextEvent ? {
    ...nextEvent,
    startTime: nextEvent.startTime?.toISOString() ?? null,
    endTime: nextEvent.endTime?.toISOString() ?? null,
  } : null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>こんにちは, {session?.displayName || 'Traveler'}! ❄️</h1>
          <p>冬のイベントを楽しもう！</p>
        </div>
      </header>

      <section className={styles.nextEvent}>
        <h2>次の予定</h2>
        <NextEventCard nextEvent={formattedEvent} />
      </section>



      <section className={styles.actions}>
        <Link href="/accounting" className={styles.card}>
          <Wallet size={32} />
          <span>立替</span>
        </Link>
        <Link href="/itinerary" className={styles.card}>
          <Calendar size={32} />
          <span>計画</span>
        </Link>
        {users.map(user => (
          <Link key={user.id} href={`/location?user=${user.id}`} className={styles.card}>
            <UserIcon size={32} />
            <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>{user.displayName}の位置情報</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
