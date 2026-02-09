import { getSession } from '@/lib/auth'
import dynamic from 'next/dynamic'
import LoadingIndicator from '@/components/LoadingIndicator'

const HomeDashboard = dynamic(() => import('@/components/HomeDashboard'), {
  ssr: false,
  loading: () => <LoadingIndicator />
})

export default async function Home() {
  const session = await getSession()

  return <HomeDashboard session={session} />
}
