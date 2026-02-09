
import { getSession } from '@/lib/auth'
import HomeDashboard from '@/components/HomeDashboard'

export default async function Home() {
  const session = await getSession()

  return <HomeDashboard session={session} />
}
