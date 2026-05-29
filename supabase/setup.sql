-- ════════════════════════════════════════════════════════════════════
--  w.inii's cloud — COMPLETE database setup
--  Paste this WHOLE file into Supabase → SQL Editor → New query → Run.
--  Safe to run once or many times (won't break anything if re-run).
-- ════════════════════════════════════════════════════════════════════

-- ─── memories (photos) ──────────────────────────────────────────────
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  caption text, month text, year int, location text,
  sticker text, sticker_rot float8 default 0,
  tape_rot float8 default -2, tape_color text default 'yellow',
  photo_path text not null, created_at timestamptz default now()
);
alter table public.memories add column if not exists location text;

-- ─── cloud_state (mood / note / painting / background) ──────────────
create table if not exists public.cloud_state (
  id int primary key, mood text, daily_note text, painting text,
  background text default 'sand', updated_at timestamptz default now()
);
insert into public.cloud_state (id, mood) values (1, 'happy') on conflict (id) do nothing;
alter table public.cloud_state add column if not exists daily_note text;
alter table public.cloud_state add column if not exists painting text;
alter table public.cloud_state add column if not exists background text default 'sand';
alter table public.cloud_state add column if not exists mood_updated_at timestamptz;
alter table public.cloud_state add column if not exists note_updated_at timestamptz;

-- ─── stamps ─────────────────────────────────────────────────────────
create table if not exists public.stamps (
  id uuid primary key default gen_random_uuid(),
  photo_path text not null, rotation float8 default 0,
  created_at timestamptz default now()
);

-- ─── doodles (sketchbook archive) ───────────────────────────────────
create table if not exists public.doodles (
  id uuid primary key default gen_random_uuid(),
  photo_path text not null, created_at timestamptz default now()
);

-- ─── security: anyone reads, only signed-in owner writes ────────────
alter table public.memories enable row level security;
alter table public.cloud_state enable row level security;
alter table public.stamps enable row level security;
alter table public.doodles enable row level security;

drop policy if exists "mem read" on public.memories;
drop policy if exists "mem write" on public.memories;
drop policy if exists "mem update" on public.memories;
drop policy if exists "mem delete" on public.memories;
create policy "mem read" on public.memories for select using (true);
create policy "mem write" on public.memories for insert with check (auth.role() = 'authenticated');
create policy "mem update" on public.memories for update using (auth.role() = 'authenticated');
create policy "mem delete" on public.memories for delete using (auth.role() = 'authenticated');

drop policy if exists "cloud read" on public.cloud_state;
drop policy if exists "cloud update" on public.cloud_state;
create policy "cloud read" on public.cloud_state for select using (true);
create policy "cloud update" on public.cloud_state for update using (auth.role() = 'authenticated');

drop policy if exists "stamps read" on public.stamps;
drop policy if exists "stamps write" on public.stamps;
drop policy if exists "stamps delete" on public.stamps;
create policy "stamps read" on public.stamps for select using (true);
create policy "stamps write" on public.stamps for insert with check (auth.role() = 'authenticated');
create policy "stamps delete" on public.stamps for delete using (auth.role() = 'authenticated');

drop policy if exists "doodles read" on public.doodles;
drop policy if exists "doodles write" on public.doodles;
drop policy if exists "doodles delete" on public.doodles;
create policy "doodles read" on public.doodles for select using (true);
create policy "doodles write" on public.doodles for insert with check (auth.role() = 'authenticated');
create policy "doodles delete" on public.doodles for delete using (auth.role() = 'authenticated');

-- ─── realtime (live updates for visitors) ───────────────────────────
do $$ begin alter publication supabase_realtime add table public.memories; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.cloud_state; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.stamps; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.doodles; exception when others then null; end $$;

-- ─── storage bucket for photos + doodles ────────────────────────────
insert into storage.buckets (id, name, public) values ('photos','photos',true) on conflict (id) do nothing;
drop policy if exists "photos read" on storage.objects;
drop policy if exists "photos write" on storage.objects;
drop policy if exists "photos delete" on storage.objects;
create policy "photos read" on storage.objects for select using (bucket_id = 'photos');
create policy "photos write" on storage.objects for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');
create policy "photos delete" on storage.objects for delete using (bucket_id = 'photos' and auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════
--  DONE. Next: Authentication → Users → Add user →
--  email chiraswinireddy02@gmail.com + a password + Auto Confirm ON.
-- ════════════════════════════════════════════════════════════════════
