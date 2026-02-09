'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Calendar, MapPin, Settings } from 'lucide-react'
import styles from './NavBar.module.css'
import { cn } from '@/lib/utils'

export function NavBar({ role }: { role?: string }) {
    const pathname = usePathname()

    // Hide nav on login page
    if (pathname === '/login') return null

    const navItems = useMemo(() => {
        const items = [
            { href: '/', label: 'ホーム', icon: Home },
            { href: '/accounting', label: '立替', icon: Wallet },
            { href: '/itinerary', label: '計画', icon: Calendar },
            { href: '/location', label: 'マップ', icon: MapPin },
        ]

        if (role === 'ADMIN') {
            items.push({ href: '/admin', label: '管理', icon: Settings })
        }
        return items
    }, [role])

    return (
        <>
            <div className={styles.spacer} />
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={cn(styles.item, isActive && styles.active)}
                        >
                            <Icon className={styles.icon} size={24} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
