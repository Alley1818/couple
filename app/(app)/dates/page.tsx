import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import DateCard from '@/components/DateCard'

export const revalidate = 60

export default async function DatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) redirect('/')

  const { data: dates } = await supabase
    .from('dates').select('*')
    .eq('couple_id', profile.couple_id)
    .order('created_at', { ascending: false })

  const now = new Date()
  // Без даты или будущие — "предстоящие"
  const upcoming = dates?.filter(d =>
    ['proposed', 'confirmed'].includes(d.status) &&
    (!d.date_at || new Date(d.date_at) >= now)
  ) ?? []

  // Прошедшие
  const past = dates?.filter(d =>
    d.status === 'done' || (d.date_at && new Date(d.date_at) < now && d.status !== 'cancelled')
  ) ?? []

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Свидания</h1>
        <Link href="/dates/new"
          className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
          + Создать
        </Link>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🗓</p>
          <p className="text-stone-600 font-medium">Пока нет свиданий</p>
          <Link href="/dates/new"
            className="inline-block mt-4 px-5 py-2.5 bg-rose-500 text-white text-sm rounded-xl font-medium">
            Создать первое
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-3 font-medium">Предстоящие</p>
          <div className="space-y-2">
            {upcoming.map(d => <DateCard key={d.id} date={d} currentUserId={user.id} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-3 font-medium">История</p>
          <div className="space-y-2">
            {past.map(d => (
              <Link key={d.id} href={`/dates/${d.id}`}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-stone-100 opacity-60 hover:opacity-100 transition-opacity">
                <div>
                  <p className="font-medium text-sm">{d.title}</p>
                  {d.date_at && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {format(new Date(d.date_at), 'd MMMM yyyy', { locale: ru })}
                    </p>
                  )}
                </div>
                <span className="text-xs text-stone-300">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
