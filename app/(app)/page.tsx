import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import DateCard from '@/components/DateCard'

// Оптимизация: revalidate каждые 60 секунд вместо динамического рендера
export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Параллельные запросы — быстрее чем последовательные
  const [profileRes, datesRes] = await Promise.all([
    supabase.from('users').select('couple_id, display_name').eq('id', user.id).single(),
    // dates запросим только если есть couple_id — но для параллельности делаем оба сразу
    supabase.from('users').select('couple_id').eq('id', user.id).single(),
  ])

  const profile = profileRes.data
  if (!profile?.couple_id) return null

  // Параллельно: ближайшее свидание + список ожидающих
  const now = new Date().toISOString()
  const [nextRes, pendingRes] = await Promise.all([
    supabase.from('dates').select('*')
      .eq('couple_id', profile.couple_id)
      .in('status', ['confirmed', 'proposed'])
      .not('date_at', 'is', null)
      .gte('date_at', now)
      .order('date_at', { ascending: true })
      .limit(1)
      .single(),
    supabase.from('dates').select('*')
      .eq('couple_id', profile.couple_id)
      .eq('status', 'proposed')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const next = nextRes.data
  const pending = pendingRes.data ?? []

  function dateLabel(dateStr: string) {
    const d = new Date(dateStr)
    if (isToday(d)) return 'Сегодня'
    if (isTomorrow(d)) return 'Завтра'
    const days = differenceInDays(d, new Date())
    if (days < 7) return `Через ${days} дн.`
    return format(d, 'd MMMM', { locale: ru })
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {profile.display_name ? `Привет, ${profile.display_name} 👋` : 'Привет 👋'}
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">Что планируем?</p>
        </div>
        <Link href="/dates/new"
          className="w-10 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xl font-light shadow-sm transition-colors">
          +
        </Link>
      </div>

      {/* Следующее свидание */}
      {next ? (
        <Link href={`/dates/${next.id}`}
          className="block bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white mb-5 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium opacity-80 uppercase tracking-wide">
              {next.status === 'confirmed' ? '✓ Подтверждено' : '⏳ Ожидает'}
            </span>
          </div>
          <h2 className="text-xl font-semibold leading-tight">{next.title}</h2>
          {next.location && <p className="text-rose-100 text-sm mt-1">📍 {next.location}</p>}
          {next.date_at && (
            <p className="text-rose-100 text-sm mt-2 font-medium">
              {dateLabel(next.date_at)} · {format(new Date(next.date_at), 'HH:mm')}
            </p>
          )}
          <p className="text-rose-200 text-xs mt-3">Нажми чтобы открыть →</p>
        </Link>
      ) : (
        <Link href="/dates/new"
          className="block bg-white border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center mb-5 hover:border-rose-200 transition-colors">
          <p className="text-3xl mb-2">🗓</p>
          <p className="font-medium text-stone-700">Запланируй свидание</p>
          <p className="text-stone-400 text-sm mt-1">Нажми чтобы создать</p>
        </Link>
      )}

      {/* Ожидают ответа */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">Ожидают ответа</p>
            <Link href="/dates" className="text-rose-500 text-sm">Все →</Link>
          </div>
          <div className="space-y-2">
            {pending.map(d => <DateCard key={d.id} date={d} currentUserId={user.id} />)}
          </div>
        </div>
      )}
    </div>
  )
}
