import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ideaId, action } = await request.json()

  if (action === 'vote') {
    await supabase.from('idea_votes').upsert({ idea_id: ideaId, user_id: user.id })
  } else {
    await supabase.from('idea_votes').delete().eq('idea_id', ideaId).eq('user_id', user.id)
  }

  const { data: votes } = await supabase.from('idea_votes').select('user_id').eq('idea_id', ideaId)
  return NextResponse.json({ votes: votes ?? [] })
}
