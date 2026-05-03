import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import DateCard from '@/components/DateCard'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('couple_id, display_name').eq('id', user.id).single()

  if (!profile?.couple_id) return null

  const { data: dates } = await supabase
    .from('dates')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .in('status', ['proposed', 'confirmed'])
    .gte('date_at', new Date().toISOString())
    .order('date_at', { ascending: true })
    .limit(5)

  const next = dates?.[0] ?? null
  const rest = dates?.slice(1) ?? []

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {profile.display_name ? `Привет, ${profile.display_name} 👋` : 'Привет 👋'}
        </h1>
        <p className="text-stone-500 text-sm mt-1">Что планируем?</p>
      </div>

      {next ? (
        <div className="bg-rose-500 rounded-2xl p-5 text-white mb-6">
          <p className="text-xs text-rose-200 uppercase tracking-wide mb-1">
            {next.status === 'confirmed' ? '✓ Подтверждено' : '⏳ Ожидает'}
          </p>
          <h2 className="text-xl font-semibold">{next.title}</h2>
          {next.location && <p className="text-rose-100 text-sm mt-1">📍 {next.location}</p>}
          <p className="text-rose-100 text-sm mt-2 font-medium">
            {format(new Date(next.date_at), 'd MMMM, HH:mm', { locale: ru })}
          </p>
        </div>
      ) : (
        <Link href="/dates/new" className="block bg-white border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center mb-6 hover:border-rose-300 transition-colors">
          <p className="text-3xl mb-2">🗓</p>
          <p className="font-medium text-stone-700">Запланируй первое свидание</p>
          <p className="text-stone-400 text-sm mt-1">Нажми чтобы создать</p>
        </Link>
      )}

      {rest.length > 0 && (
        <div>
          <h3 className="font-medium text-stone-500 text-sm uppercase tracking-wide mb-3">Ещё</h3>
          <div className="space-y-3">
            {rest.map(d => <DateCard key={d.id} date={d} currentUserId={user.id} />)}
          </div>
        </div>
      )}

      <Link
        href="/dates/new"
        className="fixed bottom-24 right-4 w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg"
      >
        +
      </Link>
    </div>
  )
}
