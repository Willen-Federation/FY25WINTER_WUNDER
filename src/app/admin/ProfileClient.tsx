'use client'

import { updateUserAction } from '@/actions/admin'
import { useState } from 'react'

interface User {
    id: string
    username: string
    displayName: string
    role: string
}

export function ProfileClient({ user }: { user: User }) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [username, setUsername] = useState(user.username)
    const [displayName, setDisplayName] = useState(user.displayName)
    const [password, setPassword] = useState('')

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)

        const formData = new FormData()
        formData.append('id', user.id)
        formData.append('username', username)
        formData.append('displayName', displayName)
        if (password) formData.append('password', password)

        // Role is ignored by backend for non-admins, but we don't send it anyway 
        // unless we want to, but regular users can't change it.

        const res = await updateUserAction(formData)
        setIsUpdating(false)

        if (res.success) {
            alert('プロフィールを更新しました')
            setPassword('')
        } else {
            alert(res.error || '更新失敗')
        }
    }

    return (
        <div>
            <div style={{ marginBottom: 30, background: 'white', padding: 20, borderRadius: 10 }}>
                <h3>プロフィール編集</h3>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 15 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 5 }}>ユーザー名</label>
                        <input
                            required
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{ padding: '10px', borderRadius: 5, border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 5 }}>表示名</label>
                        <input
                            required
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            style={{ padding: '10px', borderRadius: 5, border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: 5 }}>パスワード (変更する場合のみ入力)</label>
                        <input
                            type="text"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="新しいパスワード"
                            style={{ padding: '10px', borderRadius: 5, border: '1px solid #ddd' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUpdating}
                        style={{ padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold', marginTop: 10 }}
                    >
                        {isUpdating ? '更新中...' : '更新'}
                    </button>
                </form>
            </div>
        </div>
    )
}
