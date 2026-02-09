'use client'

import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'

const ItineraryDashboard = dynamic(() => import('@/components/ItineraryDashboard'), {
    ssr: false,
    loading: () => <LoadingIndicator />
})

export default function ItineraryDashboardWrapper() {
    return <ItineraryDashboard />
}
