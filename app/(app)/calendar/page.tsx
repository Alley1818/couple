import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) redirect('/')

  // Берём все свидания с датой (не null)
  const { data: dates } = await supabase
    .from('dates')
    .select('id, title, date_at, status, location')
    .eq('couple_id', profile.couple_id)
    .not('date_at', 'is', null)
    .in('status', ['proposed', 'confirmed'])
    .order('date_at', { ascending: true })

  return <CalendarClient dates={dates ?? []} currentUserId={user.id} />
}
