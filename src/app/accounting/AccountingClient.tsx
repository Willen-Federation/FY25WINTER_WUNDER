'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import styles from './accounting.module.css'
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from '@/actions/accounting'
import { format } from 'date-fns'

interface User {
    id: string
    displayName: string
}

interface Expense {
    id: string
    title: string
    amount: number
    payerId: string
    createdAt: string | Date
    payer: User
    splits: { userId: string, amount: number }[]
}

interface Props {
    users: User[]
    currentUserIdentity: string
    expenses: Expense[]
}

export function AccountingClient({ users, currentUserIdentity, expenses }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    // Form State
    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [payerId, setPayerId] = useState(currentUserIdentity)
    const [splits, setSplits] = useState<Record<string, number>>({}) // userId -> amount

    const handleOpen = () => {
        setEditMode(false)
        setSelectedId(null)
        setTitle('')
        setAmount('')
        setPayerId(currentUserIdentity)
        setSplits({})
        setIsOpen(true)
    }

    const handleEdit = (expense: Expense) => {
        setEditMode(true)
        setSelectedId(expense.id)
        setTitle(expense.title)
        setAmount(expense.amount.toString())
        setPayerId(expense.payerId)

        const splitMap: Record<string, number> = {}
        expense.splits.forEach(s => {
            splitMap[s.userId] = s.amount
        })
        setSplits(splitMap)

        setIsOpen(true)
    }

    const distributeEvenly = () => {
        const total = parseInt(amount) || 0
        if (total <= 0) return
        const count = users.length
        const share = Math.floor(total / count)
        const remainder = total - (share * count)

        const newSplits: Record<string, number> = {}
        users.forEach((u, i) => {
            newSplits[u.id] = share + (i === 0 ? remainder : 0)
        })
        setSplits(newSplits)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('title', title)
        formData.append('amount', amount)
        formData.append('payerId', payerId)

        const splitArray = Object.entries(splits).map(([userId, amt]) => ({
            userId,
            amount: amt
        })).filter(s => s.amount > 0)

        formData.append('splits', JSON.stringify(splitArray))

        let res;
        if (editMode && selectedId) {
            formData.append('id', selectedId)
            // @ts-ignore
            res = await updateExpenseAction({}, formData)
        } else {
            // @ts-ignore
            res = await createExpenseAction({}, formData)
        }

        setIsSubmitting(false)
        if (res?.success) {
            setIsOpen(false)
            setTitle('')
            setAmount('')
            setSplits({})
        } else {
            alert(res?.error || 'Error saving expense')
        }
    }

    const handleDelete = async () => {
        if (!selectedId || !confirm('Are you sure you want to delete this expense?')) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('id', selectedId)

        // @ts-ignore
        const res = await deleteExpenseAction({}, formData)

        setIsSubmitting(false)
        if (res?.success) {
            setIsOpen(false)
        } else {
            alert(res?.error || 'Failed to delete')
        }
    }

    return (
        <>
            <div className={styles.sectionTitle}>Recent Expenses</div>
            <div className={styles.expenseList}>
                {expenses.length > 0 ? expenses.map(e => (
                    <div key={e.id} className={styles.expenseItem} onClick={() => handleEdit(e)} style={{ cursor: 'pointer' }}>
                        <div>
                            <div className={styles.expenseTitle}>{e.title}</div>
                            <div className={styles.expenseMeta}>
                                Paid by {e.payer.displayName} • {format(new Date(e.createdAt), 'MM/dd')}
                            </div>
                        </div>
                        <div className={styles.expenseAmount}>¥{e.amount.toLocaleString()}</div>
                    </div>
                )) : (
                    <div style={{ color: '#888', textAlign: 'center' }}>No expenses yet.</div>
                )}
            </div>

            <button className={styles.fab} onClick={handleOpen}>
                <Plus size={24} />
            </button>

            {isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{editMode ? 'Edit Expense' : 'Add Expense'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Title</label>
                                <input
                                    className={styles.input}
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Dinner, Taxi, etc."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Total Amount (¥)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    onBlur={() => {
                                        // Only distribute if splits are empty to avoid overwriting manual edits
                                        if (Object.keys(splits).length === 0) distributeEvenly()
                                    }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Paid By</label>
                                <select
                                    className={styles.select}
                                    value={payerId}
                                    onChange={e => setPayerId(e.target.value)}
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.displayName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <label className={styles.label}>Splits</label>
                                    <button type="button" onClick={distributeEvenly} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Reset Evenly</button>
                                </div>
                                {users.map(u => (
                                    <div key={u.id} className={styles.splitRow}>
                                        <span className={styles.splitName}>{u.displayName}</span>
                                        <input
                                            type="number"
                                            className={styles.splitInput}
                                            value={splits[u.id] !== undefined ? splits[u.id] : ''}
                                            placeholder="0"
                                            onChange={e => setSplits({ ...splits, [u.id]: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                ))}
                                <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: 5, color: Object.values(splits).reduce((a, b) => a + b, 0) != parseInt(amount) ? 'red' : 'inherit' }}>
                                    Total: {Object.values(splits).reduce((a, b) => a + b, 0)} / {amount || 0}
                                </div>
                            </div>

                            <div className={styles.buttons}>
                                {editMode && (
                                    <button type="button" className={styles.cancelBtn} onClick={handleDelete} style={{ marginRight: 'auto', backgroundColor: '#fee', color: 'red' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
