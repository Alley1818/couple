import { createClient } from '@/lib/supabase/server';
import HomeClient from './HomeClient';
import LandingPage from '@/components/landing/LandingPage';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const { data: currentUser } = await supabase
      .from('users')
      .select('id, display_name, couple_id')
      .eq('id', user.id)
      .single();

  // Нет пары — онбординг
  if (!currentUser?.couple_id) {
    // Можно редирект или показать онбординг прямо тут
    // Пока просто landing для простоты
    return <LandingPage />;
  }

  // ... остальной код для авторизованных
  const now = new Date().toISOString();

  const [{ data: nextDate }, { data: pendingDates }, { data: partnerRows }] = await Promise.all([
    supabase
        .from('dates')
        .select('*')
        .eq('couple_id', currentUser.couple_id)
        .eq('status', 'confirmed')
        .gte('date_at', now)
        .order('date_at', { ascending: true })
        .limit(1)
        .single(),
    supabase
        .from('dates')
        .select('*')
        .eq('couple_id', currentUser.couple_id)
        .eq('status', 'proposed')
        .neq('created_by', user.id)
        .order('created_at', { ascending: false }),
    supabase
        .from('users')
        .select('id, display_name')
        .eq('couple_id', currentUser.couple_id)
        .neq('id', user.id)
        .limit(1),
  ]);

  const partner = partnerRows && partnerRows.length > 0 ? partnerRows[0] : null;

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