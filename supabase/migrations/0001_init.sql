-- ガジュマル 初期スキーマ
-- Supabaseのプロジェクト作成後、SQL Editorでこのファイルの内容をそのまま実行してください。

-- ============================================================
-- gajumaru_profiles: 1ユーザー1行（チェックリスト・デビュー日・自己紹介フォーム・ネタ帳）
-- ============================================================
create table if not exists public.gajumaru_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  debut_date date,
  checklist_state jsonb not null default '{}',
  profile_form jsonb not null default '{}',
  idea_bank jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gajumaru_profiles enable row level security;

create policy "gajumaru_profiles_select_own" on public.gajumaru_profiles
  for select using (auth.uid() = user_id);
create policy "gajumaru_profiles_insert_own" on public.gajumaru_profiles
  for insert with check (auth.uid() = user_id);
create policy "gajumaru_profiles_update_own" on public.gajumaru_profiles
  for update using (auth.uid() = user_id);

-- 新規ユーザー登録時に空レコードを自動作成
create or replace function public.handle_new_gajumaru_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.gajumaru_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_gajumaru on auth.users;
create trigger on_auth_user_created_gajumaru
  after insert on auth.users
  for each row execute function public.handle_new_gajumaru_user();

-- ============================================================
-- gajumaru_stream_logs: 配信ログ（継続トラッカー）
-- ============================================================
create table if not exists public.gajumaru_stream_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  minutes int not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists gajumaru_stream_logs_user_id_idx on public.gajumaru_stream_logs(user_id);

alter table public.gajumaru_stream_logs enable row level security;

create policy "gajumaru_stream_logs_select_own" on public.gajumaru_stream_logs
  for select using (auth.uid() = user_id);
create policy "gajumaru_stream_logs_insert_own" on public.gajumaru_stream_logs
  for insert with check (auth.uid() = user_id);
create policy "gajumaru_stream_logs_delete_own" on public.gajumaru_stream_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- gajumaru_visit_logs: 枠周り記録
-- ============================================================
create table if not exists public.gajumaru_visit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  name text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists gajumaru_visit_logs_user_id_idx on public.gajumaru_visit_logs(user_id);

alter table public.gajumaru_visit_logs enable row level security;

create policy "gajumaru_visit_logs_select_own" on public.gajumaru_visit_logs
  for select using (auth.uid() = user_id);
create policy "gajumaru_visit_logs_insert_own" on public.gajumaru_visit_logs
  for insert with check (auth.uid() = user_id);
create policy "gajumaru_visit_logs_delete_own" on public.gajumaru_visit_logs
  for delete using (auth.uid() = user_id);

-- ============================================================
-- gajumaru_win_diary: 今日できたこと日記
-- ============================================================
create table if not exists public.gajumaru_win_diary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists gajumaru_win_diary_user_id_idx on public.gajumaru_win_diary(user_id);

alter table public.gajumaru_win_diary enable row level security;

create policy "gajumaru_win_diary_select_own" on public.gajumaru_win_diary
  for select using (auth.uid() = user_id);
create policy "gajumaru_win_diary_insert_own" on public.gajumaru_win_diary
  for insert with check (auth.uid() = user_id);
create policy "gajumaru_win_diary_delete_own" on public.gajumaru_win_diary
  for delete using (auth.uid() = user_id);
