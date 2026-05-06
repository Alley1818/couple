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
        .select('id, display_name, couple_id, created_at')
        .eq('id', user.id)
        .single();

    if (!currentUser?.couple_id) {
        return <LandingPage />;
    }

    const now = new Date().toISOString();

    const [
        { data: nextDate },
        { data: pendingDates },
        { data: partnerRows },
        { data: recentMemories },
    ] = await Promise.all([
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
        supabase
            .from('memories')
            .select('id, title, description, date_at, location, address, category, created_by, photos, users(display_name)')
            .eq('couple_id', currentUser.couple_id)
            .order('date_at', { ascending: false })
            .limit(6),
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

    const formattedMemories = (recentMemories || []).map((m) => ({
        ...m,
        users: m.users?.[0] || { display_name: 'Неизвестно' },
    }));

    return (
        <HomeClient
            user={currentUser}
            partner={partner}
            heroDate={heroDate}
            pendingDates={pendingDates || []}
            recentMemories={formattedMemories}
        />
    );
}