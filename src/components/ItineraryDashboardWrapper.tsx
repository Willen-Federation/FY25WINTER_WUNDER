'use client'

import React, { Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'
import OfflinePageFallback from '@/components/OfflinePageFallback'

const ItineraryDashboard = dynamic(() => import('@/components/ItineraryDashboard'), {
    ssr: false,
    loading: () => <LoadingIndicator />
})

interface State {
    hasError: boolean
}

class ItineraryErrorBoundary extends Component<{ children: ReactNode }, State> {
    constructor(props: { children: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: Error) {
        console.error('ItineraryDashboard chunk load error:', error)
    }

    render() {
        if (this.state.hasError) {
            return <OfflinePageFallback pageName="旅の計画" />
        }
        return this.props.children
    }
}

export default function ItineraryDashboardWrapper() {
    return (
        <ItineraryErrorBoundary>
            <ItineraryDashboard />
        </ItineraryErrorBoundary>
    )
}
