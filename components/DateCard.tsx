'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type DateItem = {
  id: string
  title: string
  date_at: string | null
  location?: string
  status: 'proposed' | 'confirmed' | 'done' | 'cancelled'
  created_by: string
}

const statusStyle = {
  proposed:  'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  done:      'bg-stone-100 text-stone-400',
  cancelled: 'bg-red-50 text-red-400',
}
const statusLabel = {
  proposed: 'Ожидает',
  confirmed: 'Подтверждено',
  done: 'Прошло',
  cancelled: 'Отменено',
}

export default function DateCard({ date }: { date: DateItem; currentUserId: string }) {
  return (
    // Вся карточка — ссылка на детальную страницу
    <Link href={`/dates/${date.id}`} className="block bg-white rounded-xl p-4 border border-stone-100 hover:border-rose-200 hover:shadow-sm transition-all active:scale-[0.98]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm text-stone-900 truncate">{date.title}</p>
          {date.location && (
            <p className="text-xs text-stone-500 mt-0.5 truncate">📍 {date.location}</p>
          )}
          <p className="text-xs text-stone-400 mt-1">
            {date.date_at
              ? format(new Date(date.date_at), 'd MMMM, HH:mm', { locale: ru })
              : <span className="text-amber-500">⏰ Время не выбрано</span>
            }
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusStyle[date.status]}`}>
          {statusLabel[date.status]}
        </span>
      </div>
      <p className="text-xs text-stone-300 mt-2 text-right">Открыть →</p>
    </Link>
  )
}
