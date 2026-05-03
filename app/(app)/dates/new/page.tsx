'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewDatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    title: '',
    date_at: '',       // пустое = партнёр выберет сам
    location: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit() {
    if (!form.title.trim()) { setError('Введи название'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('users').select('couple_id').eq('id', user.id).single()
    if (!profile?.couple_id) { setError('Сначала подключи партнёра'); setLoading(false); return }

    const { data, error: err } = await supabase.from('dates').insert({
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      // date_at = null если не указали — партнёр выберет
      date_at: form.date_at ? new Date(form.date_at).toISOString() : null,
      couple_id: profile.couple_id,
      created_by: user.id,
      status: 'proposed',
    }).select().single()

    if (err) { setError('Ошибка: ' + err.message); setLoading(false); return }
    router.push(`/dates/${data.id}`)
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-stone-600">←</button>
        <h1 className="text-xl font-semibold">Новое свидание</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Название *</label>
          <input type="text" value={form.title} onChange={set('title')} placeholder="Ужин при свечах"
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Дата и время
            <span className="text-stone-400 font-normal ml-1">(необязательно — партнёр выберет)</span>
          </label>
          <input type="datetime-local" value={form.date_at} onChange={set('date_at')}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Место</label>
          <input type="text" value={form.location} onChange={set('location')} placeholder="Ресторан, парк, адрес..."
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="Что планируем, что взять с собой..."
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white resize-none" />
        </div>

        {error && <p className="text-rose-500 text-sm">{error}</p>}

        <button onClick={submit} disabled={loading || !form.title.trim()}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-medium rounded-xl text-sm transition-colors">
          {loading ? 'Создаём...' : '💝 Предложить свидание'}
        </button>

        <p className="text-center text-stone-400 text-xs">
          Партнёр получит уведомление и сможет подтвердить
        </p>
      </div>
    </div>
  )
}
