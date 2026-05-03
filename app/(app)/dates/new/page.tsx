'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewDatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', date_at: '', location: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!form.title || !form.date_at) { setError('Заполни название и дату'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('users').select('couple_id').eq('id', user.id).single()
    if (!profile?.couple_id) { setError('Сначала подключи партнёра'); setLoading(false); return }

    const { error: err } = await supabase.from('dates').insert({
      ...form,
      couple_id: profile.couple_id,
      created_by: user.id,
      status: 'proposed',
    })

    if (err) { setError('Ошибка. Попробуй ещё раз.'); setLoading(false); return }
    router.push('/')
  }

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-stone-600 text-xl">←</button>
        <h1 className="text-xl font-semibold">Новое свидание</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Название *</label>
          <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
            placeholder="Ужин в ресторане" className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Дата и время *</label>
          <input type="datetime-local" value={form.date_at} onChange={e => setForm(f => ({...f, date_at: e.target.value}))}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Место</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
            placeholder="Адрес или название" className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Описание</label>
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
            rows={3} placeholder="Что планируем..."
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white resize-none" />
        </div>

        {error && <p className="text-rose-500 text-sm">{error}</p>}

        <button onClick={submit} disabled={loading}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-medium rounded-xl transition-colors">
          {loading ? 'Создаём...' : '💝 Предложить свидание'}
        </button>
      </div>
    </div>
  )
}
