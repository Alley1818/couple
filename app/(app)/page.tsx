import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import HomeClient from './HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: currentUser } = await supabase
      .from('users')
      .select('id, display_name, couple_id')
      .eq('id', user.id)
      .single();

  if (!currentUser?.couple_id) redirect('/onboarding');

  const now = new Date().toISOString();

  const [{ data: nextDate }, { data: pendingDates }, { data: partner }] = await Promise.all([
    // Ближайшее подтверждённое свидание
    supabase
        .from('dates')
        .select('*')
        .eq('couple_id', currentUser.couple_id)
        .eq('status', 'confirmed')
        .gte('date_at', now)
        .order('date_at', { ascending: true })
        .limit(1)
        .single(),
    // Ожидающие подтверждения (для текущего пользователя — где он не создатель)
    supabase
        .from('dates')
        .select('*')
        .eq('couple_id', currentUser.couple_id)
        .eq('status', 'proposed')
        .neq('created_by', user.id)
        .order('created_at', { ascending: false }),
    // Партнёр
    supabase
        .from('users')
        .select('id, display_name')
        .eq('couple_id', currentUser.couple_id)
        .neq('id', user.id)
        .single(),
  ]);

  // Если нет confirmed в будущем — ищем любое proposed с датой
  let heroDate = nextDate;
  if (!heroDate) {
    const { data: proposedWithDate } = await supabase
        .from('dates')
        .select('*')
        .eq('couple_id', currentUser.couple_id)
        .eq('status', 'proposed')
        .not('date_at', 'is', null)
        .order('date_at', { ascending: true })
        .limit(1)
        .single();
    heroDate = proposedWithDate;
  }

  return (
      <HomeClient
          user={currentUser}
          partner={partner}
          heroDate={heroDate}
          pendingDates={pendingDates || []}
      />
  );
}