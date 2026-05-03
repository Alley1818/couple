import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { display_name } = await req.json();

    if (!display_name || typeof display_name !== 'string' || display_name.length > 50) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const { error } = await supabase
        .from('users')
        .update({ display_name: display_name.trim() })
        .eq('id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}