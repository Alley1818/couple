import { createClient } from '@/lib/supabase/server';

export async function createNotification({
                                             coupleId,
                                             excludeUserId, // кто совершил действие — ему не надо
                                             type,
                                             title,
                                             message,
                                             link,
                                         }: {
    coupleId: string;
    excludeUserId: string;
    type: string;
    title: string;
    message: string;
    link: string;
}) {
    const supabase = await createClient();

    // Находим партнёра
    const { data: partner } = await supabase
        .from('users')
        .select('id')
        .eq('couple_id', coupleId)
        .neq('id', excludeUserId)
        .single();

    if (!partner) return;

    await supabase.from('notifications').insert({
        couple_id: coupleId,
        user_id: partner.id,
        type,
        title,
        message,
        link,
    });
}