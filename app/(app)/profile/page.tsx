import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const revalidate = 0;

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: currentUser } = await supabase
        .from('users')
        .select('id, display_name, couple_id, created_at')
        .eq('id', user.id)
        .single();

    if (!currentUser?.couple_id) redirect('/onboarding');

    const [{ data: couple }, { data: partner }] = await Promise.all([
        supabase
            .from('couples')
            .select('id, invite_code, created_at')
            .eq('id', currentUser.couple_id)
            .single(),
        supabase
            .from('users')
            .select('id, display_name')
            .eq('couple_id', currentUser.couple_id)
            .neq('id', user.id)
            .single(),
    ]);

    if (!couple) redirect('/onboarding');

    return (
        <ProfileClient
            user={currentUser}
            couple={couple}
            partner={partner}
        />
    );
}