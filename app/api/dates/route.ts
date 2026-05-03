import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, notes, date_at, title, description, location, lat, lng, address } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  // Проверяем, что свидание принадлежит паре пользователя
  const { data: currentUser } = await supabase
      .from('users')
      .select('couple_id')
      .eq('id', user.id)
      .single();

  if (!currentUser?.couple_id) {
    return NextResponse.json({ error: 'No couple' }, { status: 403 });
  }

  const { data: dateRecord } = await supabase
      .from('dates')
      .select('couple_id')
      .eq('id', id)
      .single();

  if (dateRecord?.couple_id !== currentUser.couple_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (date_at !== undefined) updateData.date_at = date_at;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (lat !== undefined) updateData.lat = lat;
  if (lng !== undefined) updateData.lng = lng;
  if (address !== undefined) updateData.address = address;

  const { data, error } = await supabase
      .from('dates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const { data: currentUser } = await supabase
      .from('users')
      .select('couple_id')
      .eq('id', user.id)
      .single();

  if (!currentUser?.couple_id) {
    return NextResponse.json({ error: 'No couple' }, { status: 403 });
  }

  // Проверяем владение
  const { data: dateRecord } = await supabase
      .from('dates')
      .select('couple_id, created_by')
      .eq('id', id)
      .single();

  if (dateRecord?.couple_id !== currentUser.couple_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Удаляем фото из storage сначала
  const { data: files } = await supabase.storage
      .from('date-photos')
      .list(`${currentUser.couple_id}/${id}`);

  if (files && files.length > 0) {
    await supabase.storage
        .from('date-photos')
        .remove(files.map((f) => `${currentUser.couple_id}/${id}/${f.name}`));
  }

  const { error } = await supabase.from('dates').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}