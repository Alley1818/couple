import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import IdeaGrid from '@/components/IdeaGrid'

export default async function IdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) redirect('/')

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, idea_votes(user_id)')
    .eq('couple_id', profile.couple_id)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 pt-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Банк идей</h1>
        <p className="text-stone-500 text-sm mt-1">❤️ = оба хотят</p>
      </div>
      <IdeaGrid ideas={ideas ?? []} currentUserId={user.id} coupleId={profile.couple_id} />
    </div>
  )
}
