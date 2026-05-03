import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/FloatingNav'
import NoCoupleClient from '@/components/NoCoupleClient'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('couple_id, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return <NoCoupleClient userId={user.id} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
