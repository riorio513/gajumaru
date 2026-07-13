-- ガジュマル カレンダー機能: 知人の初配信日・やりたいこと・締切日などを登録するテーブル
create table if not exists public.gajumaru_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  kind text not null check (kind in ('friend_debut', 'todo', 'deadline')),
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists gajumaru_calendar_events_user_id_idx on public.gajumaru_calendar_events(user_id);

alter table public.gajumaru_calendar_events enable row level security;

create policy "gajumaru_calendar_events_select_own" on public.gajumaru_calendar_events
  for select using (auth.uid() = user_id);
create policy "gajumaru_calendar_events_insert_own" on public.gajumaru_calendar_events
  for insert with check (auth.uid() = user_id);
create policy "gajumaru_calendar_events_delete_own" on public.gajumaru_calendar_events
  for delete using (auth.uid() = user_id);
