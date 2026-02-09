import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminClient } from './AdminClient'
import { ProfileClient } from './ProfileClient'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    // Common layout wrapper
    const containerStyle = { padding: 20, paddingBottom: 100, maxWidth: 800, margin: '0 auto' }

    if (session.role === 'ADMIN') {
        const expenses = await prisma.expense.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, amount: true }
        })

        const userCount = await prisma.user.count()
        const locationCount = await prisma.locationLog.count()

        const users = await prisma.user.findMany({
            orderBy: { displayName: 'asc' },
            select: { id: true, displayName: true, username: true, role: true }
        })

        return (
            <div style={containerStyle}>
                <h1 style={{ marginBottom: 20 }}>管理ダッシュボード 🛠️</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 15, marginBottom: 30 }}>
                    <div style={{ background: 'white', padding: 15, borderRadius: 10 }}>
                        <h3>ユーザー数</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{userCount}</p>
                    </div>
                    <div style={{ background: 'white', padding: 15, borderRadius: 10 }}>
                        <h3>位置情報ログ</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{locationCount}</p>
                    </div>
                </div>

                <AdminClient expenses={expenses} users={users} />
            </div>
        )
    }

    // Non-admin view (Settings/Profile)
    const currentUser = await prisma.user.findUnique({
        where: { id: session.id },
        select: { id: true, username: true, displayName: true, role: true }
    })

    if (!currentUser) return <div>User not found</div>

    return (
        <div style={containerStyle}>
            <h1 style={{ marginBottom: 20 }}>設定 ⚙️</h1>
            <ProfileClient user={currentUser} />
        </div>
    )
}
