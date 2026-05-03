import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    const unreadCount = notifications?.filter((n) => !n.read).length || 0;

    return NextResponse.json({ notifications: notifications || [], unreadCount });
}

export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, readAll } = await req.json();

    if (readAll) {
        await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    } else if (id) {
        await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { couple_id, user_id, type, title, message, link } = await req.json();

    const { error } = await supabase.from('notifications').insert({
        couple_id,
        user_id,
        type,
        title,
        message,
        link,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}