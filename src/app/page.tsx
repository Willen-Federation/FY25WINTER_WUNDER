import { getSession } from '@/lib/auth'
import HomeDashboardWrapper from '@/components/HomeDashboardWrapper'

export default async function Home() {
  const session = await getSession()

  return <HomeDashboardWrapper session={session} />
}
