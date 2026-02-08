'use client'

import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'
import styles from './login.module.css'

const initialState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState)

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Winter Login ❄️</h1>

                {state?.error && (
                    <div className={styles.error}>
                        {state.error}
                    </div>
                )}

                <form action={formAction}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>User ID</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={styles.input}
                            required
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
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Enter Event'}
                    </button>
                </form>
            </div>
        </div>
    )
}
