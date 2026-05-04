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
      .select('couple_id, display_name')
      .eq('id', user.id)
      .single();

  if (!currentUser?.couple_id) {
    return NextResponse.json({ error: 'No couple' }, { status: 403 });
  }

  const { data: dateRecord } = await supabase
      .from('dates')
      .select('couple_id, created_by, title')
      .eq('id', id)
      .single();

  if (dateRecord?.couple_id !== currentUser.couple_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (dateRecord) {
    const { data: partnerRows } = await supabase
        .from('users')
        .select('id')
        .eq('couple_id', currentUser.couple_id)
        .neq('id', user.id)
        .limit(1);

    if (partnerRows && partnerRows.length > 0) {
      await supabase.from('notifications').insert({
        couple_id: currentUser.couple_id,
        user_id: partnerRows[0].id,
        type: 'date_cancelled',
        title: 'Свидание отменено',
        message: `${currentUser.display_name || 'Партнёр'} удалил(а) свидание "${dateRecord.title}"`,
        link: `/dates`,
      });
    }
  }
  if (dateRecord?.status === 'cancelled') {
    return NextResponse.json({ error: 'Cannot edit cancelled date' }, { status: 403 });
  }

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