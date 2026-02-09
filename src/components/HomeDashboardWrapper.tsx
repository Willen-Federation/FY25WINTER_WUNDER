'use client'

import React, { Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'
import OfflinePageFallback from '@/components/OfflinePageFallback'

const HomeDashboard = dynamic(() => import('@/components/HomeDashboard'), {
  ssr: false,
  loading: () => <LoadingIndicator />
})

interface State {
  hasError: boolean
}

class HomeErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('HomeDashboard chunk load error:', error)
  }

  render() {
    if (this.state.hasError) {
      return <OfflinePageFallback pageName="ホーム" />
    }
    return this.props.children
  }
}

export default function HomeDashboardWrapper({ session }: { session: any }) {
  return (
    <HomeErrorBoundary>
      <HomeDashboard session={session} />
    </HomeErrorBoundary>
  )
}
