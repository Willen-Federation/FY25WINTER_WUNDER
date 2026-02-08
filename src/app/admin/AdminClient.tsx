'use client'

import { deleteExpenseAction, clearLocationsAction } from '@/actions/admin'
import { useState } from 'react'

export function AdminClient({ expenses }: { expenses: any[] }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Delete this expense?')) return
        setIsDeleting(true)
        await deleteExpenseAction(id)
        setIsDeleting(false)
    }

    const handleClearLocations = async () => {
        if (!confirm('Clear ALL location history?')) return
        setIsDeleting(true)
        await clearLocationsAction()
        setIsDeleting(false)
    }

    return (
        <div>
            <div style={{ marginBottom: 30 }}>
                <h3>Manage Data</h3>
                <button
                    onClick={handleClearLocations}
                    disabled={isDeleting}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 5, cursor: 'pointer' }}
                >
                    Clear Location History
                </button>
            </div>

            <h3>Expenses ({expenses.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {expenses.length > 0 ? expenses.map(e => (
                    <div key={e.id} style={{ background: 'white', padding: 10, borderRadius: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{e.title} (¥{e.amount})</span>
                        <button
                            onClick={() => handleDeleteExpense(e.id)}
                            disabled={isDeleting}
                            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Delete
                        </button>
                    </div>
                )) : <p>No expenses recorded.</p>}
            </div>
        </div>
    )
}
