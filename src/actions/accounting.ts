'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

interface CreateExpenseState {
    error?: string
    success?: boolean
}

const parseSplits = (json: string) => {
    try {
        return JSON.parse(json) as { userId: string, amount: number }[]
    } catch {
        return []
    }
}

export async function createExpenseAction(
    prevState: CreateExpenseState,
    formData: FormData
) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const title = formData.get('title') as string
    const amountStr = formData.get('amount') as string
    const payerId = formData.get('payerId') as string || session.id
    const splitsJson = formData.get('splits') as string
    const createdAtStr = formData.get('createdAt') as string
    const category = formData.get('category') as string || 'その他'

    if (!title || !amountStr || !splitsJson) {
        return { error: 'Missing Required Fields' }
    }

    const totalAmount = parseInt(amountStr)
    const splits = parseSplits(splitsJson)

    // Basic validation
    if (isNaN(totalAmount)) return { error: 'Invalid Amount' }

    try {
        await prisma.expense.create({
            data: {
                title,
                amount: totalAmount,
                payerId, // Use the selected payer
                category,
                createdAt: (createdAtStr && !isNaN(Date.parse(createdAtStr))) ? new Date(createdAtStr) : new Date(),
                splits: {
                    create: splits.map(s => ({
                        userId: s.userId,
                        amount: s.amount
                    }))
                }
            }
        })

        revalidatePath('/accounting')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to create expense' }
    }
}

export async function updateExpenseAction(
    prevState: CreateExpenseState,
    formData: FormData
) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const amountStr = formData.get('amount') as string
    const payerId = formData.get('payerId') as string
    const splitsJson = formData.get('splits') as string
    const createdAtStr = formData.get('createdAt') as string
    const category = formData.get('category') as string || 'その他'

    if (!id || !title || !amountStr || !splitsJson) {
        return { error: 'Missing Required Fields' }
    }

    const totalAmount = parseInt(amountStr)
    const splits = parseSplits(splitsJson)

    if (isNaN(totalAmount)) return { error: 'Invalid Amount' }

    try {
        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Delete existing splits
            await tx.expenseSplit.deleteMany({
                where: { expenseId: id }
            })

            // Update expense and create new splits
            await tx.expense.update({
                where: { id },
                data: {
                    title,
                    amount: totalAmount,
                    payerId,
                    category,
                    createdAt: createdAtStr ? new Date(createdAtStr) : undefined,
                    splits: {
                        create: splits.map(s => ({
                            userId: s.userId,
                            amount: s.amount
                        }))
                    }
                }
            })
        })

        revalidatePath('/accounting')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to update expense' }
    }
}

export async function deleteExpenseAction(
    prevState: CreateExpenseState,
    formData: FormData
) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const id = formData.get('id') as string

    if (!id) return { error: 'Missing ID' }

    try {
        await prisma.expense.delete({
            where: { id }
        })

        revalidatePath('/accounting')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to delete expense' }
    }
}
