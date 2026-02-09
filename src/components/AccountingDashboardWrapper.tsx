'use client'

import React, { Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'
import OfflinePageFallback from '@/components/OfflinePageFallback'

const AccountingDashboard = dynamic(() => import('@/components/AccountingDashboard'), {
    ssr: false,
    loading: () => <LoadingIndicator />
})

interface State {
    hasError: boolean
}

class AccountingErrorBoundary extends Component<{ children: ReactNode }, State> {
    constructor(props: { children: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: Error) {
        console.error('AccountingDashboard chunk load error:', error)
    }

    render() {
        if (this.state.hasError) {
            return <OfflinePageFallback pageName="会計 & 精算" />
        }
        return this.props.children
    }
}

export default function AccountingDashboardWrapper() {
    return (
        <AccountingErrorBoundary>
            <AccountingDashboard />
        </AccountingErrorBoundary>
    )
}
