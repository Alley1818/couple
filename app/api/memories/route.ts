import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const filter = searchParams.get('filter') || 'all';
    const coupleId = searchParams.get('coupleId');

    if (!coupleId) return NextResponse.json({ error: 'coupleId required' }, { status: 400 });

    const limit = 10;
    const offset = (page - 1) * limit;

    let query = supabase
        .from('dates')
        .select('*, users:created_by(display_name)')
        .eq('couple_id', coupleId)
        .eq('status', 'done')
        .order('date_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (filter !== 'all') {
        query = query.eq('category', filter);
    }

    const { data: memories } = await query;

    // Получаем фото для каждого свидания
    const memoriesWithPhotos = await Promise.all(
        (memories || []).map(async (m) => {
            const { data: files } = await supabase.storage
                .from('date-photos')
                .list(`${coupleId}/${m.id}`);

            const photos = files
                ?.filter((f) => !f.name.startsWith('.'))
                .map((f) => {
                    const { data } = supabase.storage
                        .from('date-photos')
                        .getPublicUrl(`${coupleId}/${m.id}/${f.name}`);
                    return data.publicUrl;
                }) || [];

            return { ...m, photos };
        })
    );

    return NextResponse.json({ memories: memoriesWithPhotos });
}