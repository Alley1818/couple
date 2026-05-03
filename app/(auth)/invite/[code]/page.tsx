'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function join() {
      const { code } = await params
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/login?invite=${code}`); return }

      const { data: me } = await supabase.from('users').select('couple_id').eq('id', user.id).single()
      if (me?.couple_id) { setStatus('already'); return }

      const { data: couple } = await supabase.from('couples').select('id').eq('invite_code', code).single()
      if (!couple) { setStatus('error'); return }

      await supabase.from('users').update({ couple_id: couple.id }).eq('id', user.id)
      setStatus('success')
      setTimeout(() => router.push('/'), 1500)
    }
    join()
  }, [])

  const states = {
    loading: { icon: '⏳', text: 'Проверяем приглашение...' },
    success: { icon: '✅', text: 'Вы теперь пара! Переходим...' },
    error:   { icon: '❌', text: 'Ссылка недействительна.' },
    already: { icon: '💕', text: 'Вы уже в паре!' },
  }
  const s = states[status]

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">{s.icon}</div>
        <p className="text-stone-600 font-medium">{s.text}</p>
        {(status === 'error' || status === 'already') && (
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl text-sm">
            На главную
          </button>
        )}
      </div>
    </div>
  )
}
