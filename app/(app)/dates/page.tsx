import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import DateCard from '@/components/DateCard'

export default async function DatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) redirect('/')

  const { data: dates } = await supabase
    .from('dates').select('*').eq('couple_id', profile.couple_id).order('date_at', { ascending: true })

  const upcoming = dates?.filter(d => ['proposed','confirmed'].includes(d.status) && new Date(d.date_at) >= new Date()) ?? []
  const past = dates?.filter(d => d.status === 'done' || new Date(d.date_at) < new Date()) ?? []

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Свидания</h1>
        <Link href="/dates/new" className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium">+ Создать</Link>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🗓</p>
          <p className="text-stone-600 font-medium">Пока нет свиданий</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-3">Предстоящие</p>
          <div className="space-y-3">
            {upcoming.map(d => <DateCard key={d.id} date={d} currentUserId={user.id} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-3">История</p>
          <div className="space-y-2">
            {past.map(d => (
              <div key={d.id} className="bg-white rounded-xl p-4 border border-stone-100 opacity-50">
                <p className="font-medium text-sm">{d.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">{format(new Date(d.date_at), 'd MMMM yyyy', { locale: ru })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
