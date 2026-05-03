-- ============================================
-- ЗАПУСКАТЬ ТОЛЬКО НА ЧИСТОЙ БД
-- Если уже запускал — используй supabase_patch.sql
-- ============================================
create extension if not exists "uuid-ossp";

create table public.couples (
  id uuid default uuid_generate_v4() primary key,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table public.users (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  couple_id uuid references public.couples(id) on delete set null,
  created_at timestamptz default now()
);

create table public.dates (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  created_by uuid references public.users(id) not null,
  title text not null,
  description text default '',
  date_at timestamptz not null,
  location text default '',
  status text not null default 'proposed'
    check (status in ('proposed','confirmed','done','cancelled')),
  created_at timestamptz default now()
);

create table public.ideas (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  created_by uuid references public.users(id) not null,
  title text not null,
  description text default '',
  category text default 'other'
    check (category in ('restaurant','activity','travel','home','other')),
  created_at timestamptz default now()
);

create table public.idea_votes (
  id uuid default uuid_generate_v4() primary key,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(idea_id, user_id)
);

-- RLS
alter table public.users enable row level security;
alter table public.couples enable row level security;
alter table public.dates enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;

create policy "own_user" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "couple_select" on public.couples for select
  using (id in (select couple_id from public.users where id = auth.uid()));
create policy "couple_insert" on public.couples for insert with check (true);

create policy "dates_all" on public.dates for all
  using (couple_id in (select couple_id from public.users where id = auth.uid()))
  with check (couple_id in (select couple_id from public.users where id = auth.uid()));

create policy "ideas_all" on public.ideas for all
  using (couple_id in (select couple_id from public.users where id = auth.uid()))
  with check (couple_id in (select couple_id from public.users where id = auth.uid()));

create policy "votes_select" on public.idea_votes for select
  using (idea_id in (select id from public.ideas where couple_id in (
    select couple_id from public.users where id = auth.uid())));
create policy "votes_insert" on public.idea_votes for insert with check (auth.uid() = user_id);
create policy "votes_delete" on public.idea_votes for delete using (auth.uid() = user_id);

-- Realtime
drop publication if exists supabase_realtime;
create publication supabase_realtime for table public.dates, public.ideas, public.idea_votes;

-- Триггер: создаём запись в users при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
