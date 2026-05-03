import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import IdeaGrid from '@/components/ideas/IdeaGrid';
import FloatingNav from '@/components/layout/FloatingNav';

export const revalidate = 60;

export default async function IdeasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: currentUser } = await supabase
        .from('users')
        .select('couple_id')
        .eq('id', user.id)
        .single();

    if (!currentUser?.couple_id) redirect('/onboarding');

    const [{ data: ideas }, { data: votes }] = await Promise.all([
        supabase
            .from('ideas')
            .select('*')
            .eq('couple_id', currentUser.couple_id)
            .order('created_at', { ascending: false }),
        supabase
            .from('idea_votes')
            .select('idea_id, user_id')
            .in('idea_id', (await supabase.from('ideas').select('id').eq('couple_id', currentUser.couple_id)).data?.map(i => i.id) || []),
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white pb-32">
            <div className="mx-auto max-w-lg px-5 pt-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Идеи</h1>
                    <p className="mt-1 text-sm text-gray-500">Банк идей для свиданий</p>
                </div>
                <IdeaGrid ideas={ideas || []} votes={votes || []} currentUserId={user.id} />
            </div>
            <FloatingNav />
        </div>
    );
}