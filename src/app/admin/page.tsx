
// src/app/admin/page.tsx
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminClient } from './AdminClient'

export default async function AdminPage() {
    const session = await getSession()
    if (session?.role !== 'ADMIN') {
        return <div style={{ padding: 20, textAlign: 'center', marginTop: 50 }}>
            <h1>🚫 Access Denied</h1>
            <p>Only administrators can access this page.</p>
        </div>
    }

    const expenses = await prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, amount: true }
    })

    const userCount = await prisma.user.count()
    const locationCount = await prisma.locationLog.count()

    return (
        <div style={{ padding: 20, paddingBottom: 100, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 20 }}>Admin Dashboard 🛠️</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 15, marginBottom: 30 }}>
                <div style={{ background: 'white', padding: 15, borderRadius: 10 }}>
                    <h3>Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{userCount}</p>
                </div>
                <div style={{ background: 'white', padding: 15, borderRadius: 10 }}>
                    <h3>Location Logs</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{locationCount}</p>
                </div>
            </div>

            <AdminClient expenses={expenses} />
        </div>
    )
}
