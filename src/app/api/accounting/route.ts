
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    const session = await getSession()
    // If no session, balances might be wrong (all relative to ''), but data is still public?
    // Assuming data is protected or public. Existing page didn't enforce auth redirect, just used session?.id.

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

    // Filter expenses based on role
    let filteredExpenses = expenses;
    // @ts-ignore
    if (session?.role !== 'ADMIN') {
        filteredExpenses = expenses.filter(e =>
            e.payerId === currentUserId ||
            e.splits.some(s => s.userId === currentUserId)
        )
    }

    const clientExpenses = filteredExpenses.map(e => ({
        ...e,
        createdAt: e.createdAt.toISOString() // Serialize Date
    }))

    // Calculate My Category Totals (What I consumed)
    // Group by category, sum up my split amount + residual if payer
    const categoryTotals: Record<string, number> = {}

    // Debug Logging
    console.log(`[AccountingAPI] Calculating for User: ${currentUserId}`)

    expenses.forEach(e => {
        // Exclude transfers from expense totals
        if (e.title.startsWith('送金:')) return

        let myConsumption = 0

        // 1. Explicit Split
        const mySplit = e.splits.find(s => s.userId === currentUserId)
        if (mySplit) myConsumption += mySplit.amount

        // 2. Residual if I am Payer (Total Amount - Sum of All Splits)
        let residual = 0
        if (e.payerId === currentUserId) {
            const totalSplits = e.splits.reduce((sum, s) => sum + s.amount, 0)
            residual = e.amount - totalSplits
            if (residual > 0) {
                myConsumption += residual
            }
        }

        // Detailed Log for debugging specific items (can remove later)
        if (myConsumption > 0 || e.payerId === currentUserId || e.splits.some(s => s.userId === currentUserId)) {
            console.log(`[Expense] ID=${e.id.slice(0, 4)} Title="${e.title}" Amount=${e.amount} Payer=${e.payerId === currentUserId ? 'ME' : 'OTHER'} MySplit=${mySplit?.amount || 0} Residual=${residual} Consumption=${myConsumption}`)
        }

        if (myConsumption > 0) {
            const cat = e.category || 'その他'
            categoryTotals[cat] = (categoryTotals[cat] || 0) + myConsumption
        }
    })

    console.log('[AccountingAPI] Final Totals:', categoryTotals)

    return NextResponse.json({
        balances,
        clientUsers,
        clientExpenses,
        currentUserIdentity: currentUserId,
        categoryTotals
    })
}
