'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function nanoid(n = 8) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(n))).map(b => chars[b % chars.length]).join('')
}

export default function NoCoupleClient({ userId }: { userId: string }) {
  const [step, setStep] = useState<'start' | 'done'>('start')
  const [link, setLink] = useState('')
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function create() {
    setLoading(true)
    setError('')
    const code = nanoid()

    // 1. Сохраняем имя
    if (name.trim()) {
      const { error: nameErr } = await supabase
        .from('users')
        .update({ display_name: name.trim() })
        .eq('id', userId)
      if (nameErr) console.error('name error:', nameErr)
    }

    // 2. Создаём пару
    const { data: couple, error: coupleErr } = await supabase
      .from('couples')
      .insert({ invite_code: code })
      .select()
      .single()

    if (coupleErr || !couple) {
      console.error('couple error:', coupleErr)
      setError(`Ошибка создания пары: ${coupleErr?.message}`)
      setLoading(false)
      return
    }

    // 3. Привязываем себя к паре
    const { error: linkErr } = await supabase
      .from('users')
      .update({ couple_id: couple.id })
      .eq('id', userId)

    if (linkErr) {
      console.error('link error:', linkErr)
      setError(`Ошибка: ${linkErr?.message}`)
      setLoading(false)
      return
    }

    setLink(`${window.location.origin}/invite/${code}`)
    setStep('done')
    setLoading(false)
  }

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'done') return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔗</div>
          <h1 className="text-xl font-semibold">Пара создана!</h1>
          <p className="text-stone-500 text-sm mt-1">Отправь ссылку партнёру</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <div className="bg-stone-50 rounded-xl p-3 mb-4 break-all">
            <p className="text-xs text-stone-400 mb-1">Ссылка-приглашение</p>
            <p className="text-xs font-mono text-stone-700">{link}</p>
          </div>
          <button
            onClick={() => navigator.share ? navigator.share({ url: link, title: 'Присоединись к DateApp' }) : copy()}
            className="w-full py-3 bg-rose-500 text-white font-medium rounded-xl text-sm mb-2"
          >
            📤 Поделиться
          </button>
          <button onClick={copy} className="w-full py-2.5 border border-stone-200 text-stone-600 rounded-xl text-sm">
            {copied ? '✓ Скопировано!' : '📋 Скопировать ссылку'}
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full mt-3 py-2 text-stone-400 text-xs hover:text-stone-600"
          >
            Партнёр уже присоединился → войти
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💑</div>
          <h1 className="text-xl font-semibold">Добро пожаловать!</h1>
          <p className="text-stone-500 text-sm mt-1">Как тебя зовут?</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Твоё имя"
            onKeyDown={e => e.key === 'Enter' && create()}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm mb-4"
          />
          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-xl p-3 mb-4">
              {error}
              <br />
              <span className="text-red-400">Открой консоль браузера (F12) для деталей</span>
            </div>
          )}
          <button
            onClick={create}
            disabled={loading}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-medium rounded-xl text-sm"
          >
            {loading ? 'Создаём...' : '💝 Создать пару'}
          </button>
          <p className="text-center text-stone-400 text-xs mt-3">Получишь ссылку для партнёра</p>
        </div>
      </div>
    </div>
  )
}
