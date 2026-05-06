import { createClient } from '@/lib/supabase/server';
import MemoriesClient from './MemoriesClient';
import { redirect } from 'next/navigation';

export const revalidate = 60;

export default async function MemoriesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: currentUser } = await supabase
        .from('users')
        .select('couple_id')
        .eq('id', user.id)
        .single();

    if (!currentUser?.couple_id) {
        redirect('/onboarding');
    }

    const coupleId = currentUser.couple_id;

    const { data: memories } = await supabase
        .from('memories')
        .select('id, title, description, date_at, location, address, category, created_by, photos, users(display_name)')
        .eq('couple_id', coupleId)
        .order('date_at', { ascending: false })
        .limit(20);

    const formattedMemories = (memories || []).map((m) => ({
        ...m,
        users: m.users?.[0] || { display_name: 'Неизвестно' },
    }));

    return (
        <MemoriesClient
            initialMemories={formattedMemories}
            coupleId={coupleId}
        />
    );
}