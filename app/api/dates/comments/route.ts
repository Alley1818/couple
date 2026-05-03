import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateId = searchParams.get('dateId');
    if (!dateId) return NextResponse.json({ error: 'dateId required' }, { status: 400 });

    const { data: comments } = await supabase
        .from('date_comments')
        .select('*, users(display_name)')
        .eq('date_id', dateId)
        .order('created_at', { ascending: true });

    return NextResponse.json({ comments: comments || [] });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { dateId, text } = await req.json();
    if (!dateId || !text?.trim()) {
        return NextResponse.json({ error: 'dateId and text required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('date_comments')
        .insert({ date_id: dateId, user_id: user.id, text: text.trim() })
        .select('*, users(display_name)')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}