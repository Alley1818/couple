import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const dateId = formData.get('dateId') as string;
    const file = formData.get('file') as File;

    if (!dateId || !file) {
        return NextResponse.json({ error: 'dateId and file required' }, { status: 400 });
    }

    const { data: currentUser } = await supabase
        .from('users')
        .select('couple_id')
        .eq('id', user.id)
        .single();

    if (!currentUser?.couple_id) {
        return NextResponse.json({ error: 'No couple' }, { status: 403 });
    }

    // Проверяем количество фото
    const { data: existingPhotos } = await supabase.storage
        .from('date-photos')
        .list(`${currentUser.couple_id}/${dateId}`);

    const photoCount = existingPhotos?.filter(f => !f.name.startsWith('.')).length || 0;
    if (photoCount >= 10) {
        return NextResponse.json({ error: 'Max 10 photos' }, { status: 400 });
    }

    const timestamp = Date.now();
    const path = `${currentUser.couple_id}/${dateId}/${timestamp}-${file.name}`;

    const { data, error } = await supabase.storage
        .from('date-photos')
        .upload(path, file);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: urlData } = supabase.storage
        .from('date-photos')
        .getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl });
}

export async function DELETE(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) return NextResponse.json({ error: 'Path required' }, { status: 400 });

    const { error } = await supabase.storage.from('date-photos').remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}