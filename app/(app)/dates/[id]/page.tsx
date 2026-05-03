import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DateDetailClient from './DateDetailClient';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: currentUser } = await supabase
      .from('users')
      .select('id, display_name, couple_id')
      .eq('id', user.id)
      .single();

  if (!currentUser?.couple_id) redirect('/onboarding');

  const [{ data: date }, { data: partner }] = await Promise.all([
    supabase
        .from('dates')
        .select('*')
        .eq('id', id)
        .eq('couple_id', currentUser.couple_id)
        .single(),
    supabase
        .from('users')
        .select('id, display_name')
        .eq('couple_id', currentUser.couple_id)
        .neq('id', user.id)
        .single(),
  ]);

  if (!date) redirect('/dates');

  // Получаем фото из Storage
  const { data: photos } = await supabase.storage
      .from('date-photos')
      .list(`${currentUser.couple_id}/${date.id}`, { limit: 10 });

  const photoUrls =
      photos
          ?.filter((p) => !p.name.startsWith('.'))
          .map((p) => {
            const { data } = supabase.storage
                .from('date-photos')
                .getPublicUrl(`${currentUser.couple_id}/${date.id}/${p.name}`);
            return data.publicUrl;
          }) || [];

  return (
      <DateDetailClient
          date={date}
          currentUser={currentUser}
          partner={partner}
          photos={photoUrls}
      />
  );
}