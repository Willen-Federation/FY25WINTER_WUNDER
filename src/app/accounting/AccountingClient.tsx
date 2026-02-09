'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowRightLeft, Banknote, Receipt } from 'lucide-react'
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
    const [mode, setMode] = useState<'expense' | 'transfer'>('expense')

    // Form State
    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [memo, setMemo] = useState('')
    const [date, setDate] = useState('')
    const [payerId, setPayerId] = useState(currentUserIdentity)
    const [receiverId, setReceiverId] = useState(users.find(u => u.id !== currentUserIdentity)?.id || users[0]?.id)
    const [splits, setSplits] = useState<Record<string, number>>({}) // userId -> amount

    const handleOpen = () => {
        setEditMode(false)
        setSelectedId(null)
        setTitle('')
        setAmount('')
        setMemo('')
        setDate(format(new Date(), 'yyyy-MM-dd'))
        setPayerId(currentUserIdentity)
        setReceiverId(users.find(u => u.id !== currentUserIdentity)?.id || users[0]?.id)
        setSplits({})
        setMode('expense')
        setIsOpen(true)
    }

    const handleEdit = (expense: Expense) => {
        setEditMode(true)
        setSelectedId(expense.id)
        setTitle(expense.title)
        setAmount(expense.amount.toString())
        setPayerId(expense.payerId)
        setMemo('')
        setDate(format(new Date(expense.createdAt), 'yyyy-MM-dd'))

        // Detect if it's a transfer (optional logic, but simple check: 1 split, matches amount, title contains "送金")
        // For now, let's just assume expense mode for editing unless we store type.
        // We can infer: if 1 split == amount and != payer, maybe transfer?
        // But user can edit anyway.
        // Let's stick to expense mode for edits to keep it simple, or check title.
        const isTransfer = expense.title.startsWith("送金:")
        setMode(isTransfer ? 'transfer' : 'expense')

        if (isTransfer) {
            const splitUser = expense.splits.find(s => s.amount > 0)
            if (splitUser) setReceiverId(splitUser.userId)

            // Extract memo from title if possible
            // Format: "送金: Sender -> Receiver (Memo)"
            const match = expense.title.match(/\((.+)\)$/)
            if (match) {
                setMemo(match[1])
            }
        }

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

        if (mode === 'transfer') {
            // Transfer logic
            const sender = users.find(u => u.id === payerId)?.displayName || 'Unknown'
            const receiver = users.find(u => u.id === receiverId)?.displayName || 'Unknown'
            let transferTitle = `送金: ${sender} -> ${receiver}`
            if (memo.trim()) {
                transferTitle += ` (${memo.trim()})`
            }

            formData.append('title', transferTitle)
            formData.append('amount', amount)
            formData.append('payerId', payerId)

            // Split: 100% to receiver
            const transferSplit = [{ userId: receiverId, amount: parseInt(amount) }]
            formData.append('splits', JSON.stringify(transferSplit))
            if (date) {
                formData.append('createdAt', new Date(date).toISOString())
            }
        } else {
            // Expense logic (existing)
            formData.append('title', title)
            formData.append('amount', amount)
            formData.append('payerId', payerId)

            const splitArray = Object.entries(splits).map(([userId, amt]) => ({
                userId,
                amount: amt
            })).filter(s => s.amount > 0)

            formData.append('splits', JSON.stringify(splitArray))
        }

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
            // Reset states properly
            setTitle('')
            setAmount('')
            setMemo('')
            setSplits({})
        } else {
            alert(res?.error || 'Error saving')
        }
    }

    const handleDelete = async () => {
        if (!selectedId || !confirm('この立替記録を削除しますか？')) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('id', selectedId)

        // @ts-ignore
        const res = await deleteExpenseAction({}, formData)

        setIsSubmitting(false)
        if (res?.success) {
            setIsOpen(false)
        } else {
            alert(res?.error || '削除に失敗しました')
        }
    }

    return (
        <>
            <div className={styles.sectionTitle}>最近の立替</div>
            <div className={styles.expenseList}>
                {expenses.length > 0 ? expenses.map(e => {
                    const isTransfer = e.title.startsWith("送金:")
                    return (
                        <div key={e.id} className={styles.expenseItem} onClick={() => handleEdit(e)} style={{ cursor: 'pointer', borderLeft: isTransfer ? '4px solid #10b981' : '4px solid #3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ color: isTransfer ? '#10b981' : '#3b82f6' }}>
                                    {isTransfer ? <ArrowRightLeft size={24} /> : <Receipt size={24} />}
                                </div>
                                <div>
                                    <div className={styles.expenseTitle}>{e.title}</div>
                                    <div className={styles.expenseMeta}>
                                        {isTransfer ? '送金者' : '支払者'}: {e.payer.displayName} • {format(new Date(e.createdAt), 'MM/dd')}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.expenseAmount}>¥{e.amount.toLocaleString()}</div>
                        </div>
                    )
                }) : (
                    <div style={{ color: '#888', textAlign: 'center' }}>立替記録なし</div>
                )}
            </div>

            <button className={styles.fab} onClick={handleOpen}>
                <Plus size={24} />
            </button>

            {isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                            <button
                                type="button"
                                onClick={() => setMode('expense')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: 5,
                                    border: '1px solid #ddd',
                                    background: mode === 'expense' ? '#3b82f6' : 'white',
                                    color: mode === 'expense' ? 'white' : '#666',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                <Receipt size={16} style={{ marginBottom: -3, marginRight: 5 }} />
                                立替記録
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('transfer')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: 5,
                                    border: '1px solid #ddd',
                                    background: mode === 'transfer' ? '#10b981' : 'white',
                                    color: mode === 'transfer' ? 'white' : '#666',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                <ArrowRightLeft size={16} style={{ marginBottom: -3, marginRight: 5 }} />
                                送金・精算
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Common Amount Field */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>金額 (円)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="1000"
                                />
                            </div>

                            {mode === 'expense' ? (
                                <>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>タイトル</label>
                                        <input
                                            className={styles.input}
                                            required
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="夕食、タクシー代など"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>支払者</label>
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
                                    {/* Splits */}
                                    <div className={styles.formGroup}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <label className={styles.label}>割り勘 (対象者)</label>
                                            <button type="button" onClick={distributeEvenly} style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#3b82f6', background: 'none', border: 'none' }}>
                                                等分にリセット
                                            </button>
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
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Transfer Mode */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>送金者 (支払った人)</label>
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
                                    <div style={{ textAlign: 'center', margin: '10px 0', color: '#888' }}>
                                        <ArrowRightLeft size={24} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>受取者 (もらった人)</label>
                                        <select
                                            className={styles.select}
                                            value={receiverId}
                                            onChange={e => setReceiverId(e.target.value)}
                                        >
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.displayName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>日付</label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            required
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>メモ (オプション)</label>
                                        <input
                                            className={styles.input}
                                            value={memo}
                                            onChange={e => setMemo(e.target.value)}
                                            placeholder="精算の備考など"
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 10 }}>
                                        ※ 「{users.find(u => u.id === payerId)?.displayName}」から「{users.find(u => u.id === receiverId)?.displayName}」へ送金した記録を作成します。
                                    </p>
                                </>
                            )}

                            <div className={styles.buttons}>
                                {editMode && (
                                    <button type="button" className={styles.cancelBtn} onClick={handleDelete} style={{ marginRight: 'auto', backgroundColor: '#fee', color: 'red' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsOpen(false)}>キャンセル</button>
                                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                    {isSubmitting ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
