'use client'

import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'

const HomeDashboard = dynamic(() => import('@/components/HomeDashboard'), {
  ssr: false,
  loading: () => <LoadingIndicator />
})

export default function HomeDashboardWrapper({ session }: { session: any }) {
  return <HomeDashboard session={session} />
}
