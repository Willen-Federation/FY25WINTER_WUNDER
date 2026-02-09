'use client'

import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'

const AccountingDashboard = dynamic(() => import('@/components/AccountingDashboard'), {
    ssr: false,
    loading: () => <LoadingIndicator />
})

export default function AccountingDashboardWrapper() {
    return <AccountingDashboard />
}
