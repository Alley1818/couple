'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type DateItem = {
  id: string; title: string; date_at: string; location?: string
  status: 'proposed' | 'confirmed' | 'done' | 'cancelled'; created_by: string
}

const statusStyle = {
  proposed:  'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  done:      'bg-stone-50 text-stone-400',
  cancelled: 'bg-red-50 text-red-400',
}
const statusLabel = { proposed: 'Ожидает', confirmed: 'Подтверждено', done: 'Прошло', cancelled: 'Отменено' }

export default function DateCard({ date, currentUserId }: { date: DateItem; currentUserId: string }) {
  const [status, setStatus] = useState(date.status)
  const [loading, setLoading] = useState(false)

  async function updateStatus(s: string) {
    setLoading(true)
    const res = await fetch('/api/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: date.id, status: s }),
    })
    if (res.ok) setStatus(s as typeof status)
    setLoading(false)
  }

  const canConfirm = status === 'proposed' && date.created_by !== currentUserId

  return (
    <div className="bg-white rounded-xl p-4 border border-stone-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-sm">{date.title}</p>
          {date.location && <p className="text-xs text-stone-500 mt-0.5">📍 {date.location}</p>}
          <p className="text-xs text-stone-400 mt-1">{format(new Date(date.date_at), 'd MMMM, HH:mm', { locale: ru })}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusStyle[status]}`}>
          {statusLabel[status]}
        </span>
      </div>

      {canConfirm && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => updateStatus('confirmed')} disabled={loading}
            className="flex-1 py-2 bg-rose-500 text-white text-xs font-medium rounded-lg disabled:opacity-50">
            ✓ Подтверждаю
          </button>
          <button onClick={() => updateStatus('cancelled')} disabled={loading}
            className="px-3 py-2 border border-stone-200 text-stone-400 text-xs rounded-lg disabled:opacity-50">
            ✕
          </button>
        </div>
      )}

      {status === 'confirmed' && (
        <button onClick={() => updateStatus('done')} disabled={loading}
          className="mt-3 w-full py-1.5 text-xs text-stone-400 border border-stone-100 rounded-lg hover:bg-stone-50">
          Отметить как прошедшее
        </button>
      )}
    </div>
  )
}
