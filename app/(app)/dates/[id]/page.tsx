import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import Link from 'next/link'
import DateDetailClient from './DateDetailClient'

export default async function DateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) redirect('/')

  const { data: date } = await supabase
    .from('dates').select('*').eq('id', id).eq('couple_id', profile.couple_id).single()
  if (!date) notFound()

  // Фото этого свидания
  const { data: files } = await supabase.storage
    .from('date-photos')
    .list(`${profile.couple_id}/${id}`)

  const photos: string[] = []
  if (files && files.length > 0) {
    for (const f of files) {
      const { data } = supabase.storage
        .from('date-photos')
        .getPublicUrl(`${profile.couple_id}/${id}/${f.name}`)
      photos.push(data.publicUrl)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      {/* Назад */}
      <Link href="/dates" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm mb-6">
        ← Все свидания
      </Link>

      <DateDetailClient
        date={date}
        currentUserId={user.id}
        coupleId={profile.couple_id}
        initialPhotos={photos}
      />
    </div>
  )
}
