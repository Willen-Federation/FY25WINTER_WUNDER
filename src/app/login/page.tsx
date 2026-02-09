'use client'

import { useActionState, useEffect, useState } from 'react'
import { loginAction } from '@/actions/auth'
import styles from './login.module.css'

const initialState = {
    error: '',
}

import LoadingIndicator from '@/components/LoadingIndicator'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState)
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOffline(!navigator.onLine)
            const handleOnline = () => setIsOffline(false)
            const handleOffline = () => setIsOffline(true)
            window.addEventListener('online', handleOnline)
            window.addEventListener('offline', handleOffline)
            return () => {
                window.removeEventListener('online', handleOnline)
                window.removeEventListener('offline', handleOffline)
            }
        }
    }, [])

    const handleSubmit = (formData: FormData) => {
        if (isOffline) return
        formAction(formData)
    }

    return (
        <div className={styles.container}>
            {isPending && <LoadingIndicator />}
            <div className={styles.card}>
                <h1 className={styles.title}>Winter Login ❄️</h1>

                {isOffline && (
                    <div style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>
                        オフラインのためログインできません。接続を確認してください。
                    </div>
                )}

                {state?.error && (
                    <div className={styles.error}>
                        {state.error}
                    </div>
                )}

                <form action={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>User ID</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={styles.input}
                            required
                            disabled={isOffline}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={styles.input}
                            required
                            disabled={isOffline}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={isPending || isOffline}>
                        {isPending ? 'Logging in...' : 'Enter Event'}
                    </button>
                </form>
            </div>
        </div>
    )
}
