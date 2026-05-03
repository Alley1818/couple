import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import HomeClient from '@/app/(app)/HomeClient';
import LandingPage from '@/components/landing/LandingPage';

export const revalidate = 60;

export default async function RootPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Если авторизован — показываем приложение
    if (user) {
        const { data: currentUser } = await supabase
            .from('users')
            .select('id, display_name, couple_id')
            .eq('id', user.id)
            .single();

        if (!currentUser?.couple_id) redirect('/onboarding');

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

        const partner = partnerRows?.[0] ?? null;

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

    // Неавторизован — landing page
    return <LandingPage />;
}