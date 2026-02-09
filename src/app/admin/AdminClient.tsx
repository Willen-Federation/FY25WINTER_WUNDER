
'use client'

import { deleteExpenseAction, clearLocationsAction, createUserAction, deleteUserAction, updateUserAction } from '@/actions/admin'
import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'

interface User {
    id: string
    username: string
    displayName: string
    role: string
}

export function AdminClient({ expenses, users }: { expenses: any[], users: User[] }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Create/Edit User Form State
    const [newUsername, setNewUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newDisplayName, setNewDisplayName] = useState('')
    const [newRole, setNewRole] = useState('USER')
    const [editingUserId, setEditingUserId] = useState<string | null>(null)

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('この立替記録を削除しますか？')) return
        setIsDeleting(true)
        await deleteExpenseAction(id)
        setIsDeleting(false)
    }

    const handleClearLocations = async () => {
        if (!confirm('全ての位置情報履歴を削除しますか？')) return
        setIsDeleting(true)
        await clearLocationsAction()
        setIsDeleting(false)
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('このユーザーを削除しますか？\n(関連する立替記録なども削除される可能性があります)')) return
        setIsDeleting(true)
        const res = await deleteUserAction(id)
        if (!res.success) alert(res.error)
        setIsDeleting(false)
    }

    const handleEditUser = (user: User) => {
        setEditingUserId(user.id)
        setNewUsername(user.username)
        setNewDisplayName(user.displayName)
        setNewRole(user.role)
        setNewPassword('') // Reset password field
    }

    const handleCancelEdit = () => {
        setEditingUserId(null)
        setNewUsername('')
        setNewDisplayName('')
        setNewRole('USER')
        setNewPassword('')
    }

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        const formData = new FormData()
        formData.append('username', newUsername)
        formData.append('password', newPassword)
        formData.append('displayName', newDisplayName)
        formData.append('role', newRole)

        let res
        if (editingUserId) {
            formData.append('id', editingUserId)
            res = await updateUserAction(formData)
        } else {
            res = await createUserAction(formData)
        }

        setIsCreating(false)

        if (res.success) {
            handleCancelEdit()
        } else {
            alert(res.error || (editingUserId ? '更新失敗' : '作成失敗'))
        }
    }

    return (
        <div>
            <div style={{ marginBottom: 30, background: 'white', padding: 20, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>ユーザー管理 ({users.length})</h3>
                    {editingUserId && (
                        <button onClick={handleCancelEdit} style={{ fontSize: '0.8rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <X size={16} /> 編集キャンセル
                        </button>
                    )}
                </div>

                {/* Create/Edit User Form */}
                <form onSubmit={handleSubmitUser} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20, marginTop: 10, padding: 15, background: editingUserId ? '#eff6ff' : '#f5f5f5', borderRadius: 8, border: editingUserId ? '1px solid #3b82f6' : '1px solid transparent' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ユーザー名</label>
                        <input
                            required
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            placeholder="user01"
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>パスワード {editingUserId && '(変更なしなら空欄)'}</label>
                        <input
                            type="text"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder={editingUserId ? "変更する場合のみ入力" : "password"}
                            required={!editingUserId}
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>表示名</label>
                        <input
                            required
                            value={newDisplayName}
                            onChange={e => setNewDisplayName(e.target.value)}
                            placeholder="田中 太郎"
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>権限</label>
                        <select
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd', minWidth: 100 }}
                        >
                            <option value="USER">一般</option>
                            <option value="ADMIN">管理者</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        style={{ padding: '8px 16px', background: editingUserId ? '#f59e0b' : '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isCreating ? '処理中...' : (editingUserId ? '更新' : '作成')}
                    </button>
                    {editingUserId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isCreating}
                            style={{ padding: '8px 16px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            キャンセル
                        </button>
                    )}
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {users.map(u => (
                        <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>{u.displayName}</span>
                                    <span style={{ marginLeft: 10, color: '#666', fontSize: '0.9rem' }}>({u.username})</span>
                                    {u.role === 'ADMIN' && <span style={{ marginLeft: 10, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}>ADMIN</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => handleEditUser(u)}
                                    disabled={isDeleting || (editingUserId === u.id)}
                                    style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}
                                >
                                    <Pencil size={14} /> 編集
                                </button>
                                {u.role !== 'ADMIN' && (
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        disabled={isDeleting}
                                        style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}
                                    >
                                        <Trash2 size={14} /> 削除
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: 30 }}>
                <h3>データ管理</h3>
                <button
                    onClick={handleClearLocations}
                    disabled={isDeleting}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 5, cursor: 'pointer' }}
                >
                    位置情報履歴を削除
                </button>
            </div>

            <h3>立替記録 ({expenses.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {expenses.length > 0 ? expenses.map(e => (
                    <div key={e.id} style={{ background: 'white', padding: 10, borderRadius: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{e.title} (¥{e.amount})</span>
                        <button
                            onClick={() => handleDeleteExpense(e.id)}
                            disabled={isDeleting}
                            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            削除
                        </button>
                    </div>
                )) : <p>立替記録なし</p>}
            </div>
        </div>
    )
}
