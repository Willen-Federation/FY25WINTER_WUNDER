
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import styles from './accounting.module.css'
import { AccountingClient } from './AccountingClient'


export default async function AccountingPage() {
    const session = await getSession()
    const users = await prisma.user.findMany({
        include: {
            expensesPaid: true,
            expenseSplits: true
        }
    })

    const expenses = await prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
        include: { payer: true, splits: { include: { user: true } } }
    })

    // Calculate Balances
    const balances = users.map(user => {
        const paidTotal = user.expensesPaid.reduce((sum, e) => sum + e.amount, 0)
        const splitTotal = user.expenseSplits.reduce((sum, s) => sum + s.amount, 0)
        const net = paidTotal - splitTotal
        return {
            id: user.id,
            displayName: user.displayName,
            net
        }
    })

    // Sanitize users for client
    const clientUsers = users.map(u => ({
        id: u.id,
        displayName: u.displayName
    }))

    const clientExpenses = expenses.map(e => ({
        ...e,
        createdAt: e.createdAt.toISOString()
    }))

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>会計 & 精算 💰</h1>

            <section className={styles.summaryGrid}>
                {balances.map(u => (
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

            <AccountingClient users={clientUsers} currentUserIdentity={session?.id || ''} expenses={clientExpenses} />
        </div>
    )
}
