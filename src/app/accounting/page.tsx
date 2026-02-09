
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
    const currentUserId = session?.id || ''

    const balances = users.map(user => {
        if (user.id === currentUserId) {
            // Self: Show Global Net Balance
            // Total I Paid - Total I Consumed
            const myPaid = expenses.filter(e => e.payerId === user.id).reduce((sum, e) => sum + e.amount, 0)
            const myConsumed = expenses.reduce((sum, e) => {
                const s = e.splits.find(split => split.userId === user.id)
                return sum + (s?.amount || 0)
            }, 0)

            return {
                id: user.id,
                displayName: '合計貸借額',
                net: myPaid - myConsumed
            }
        } else {
            // Others: Show Pairwise Balance (Relative to Logged-in User)
            // Positive: They owe me
            // Negative: I owe them
            let net = 0

            // 1. I Paid, They Consumed -> They owe me (+)
            expenses.filter(e => e.payerId === currentUserId).forEach(e => {
                const s = e.splits.find(split => split.userId === user.id)
                if (s) net += s.amount
            })

            // 2. They Paid, I Consumed -> I owe them (-)
            expenses.filter(e => e.payerId === user.id).forEach(e => {
                const s = e.splits.find(split => split.userId === currentUserId)
                if (s) net -= s.amount
            })

            return {
                id: user.id,
                displayName: user.displayName,
                net
            }
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
