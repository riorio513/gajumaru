-- ガジュマル 追加スキーマ（お役立ち情報 / 準備ロードマップ / 枠周り目標）

-- ============================================================
-- gajumaru_profiles に列追加
-- ============================================================
alter table public.gajumaru_profiles
  add column if not exists prep_start_date date,
  add column if not exists visit_goal int;

-- ============================================================
-- gajumaru_help_articles: 管理人が編集する「お役立ち情報」
-- 閲覧は誰でも可（ゲスト含む）、追加/編集/削除は管理人メールのみ
-- ============================================================
create table if not exists public.gajumaru_help_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gajumaru_help_articles enable row level security;

create policy "gajumaru_help_articles_select_all" on public.gajumaru_help_articles
  for select using (true);

create policy "gajumaru_help_articles_admin_insert" on public.gajumaru_help_articles
  for insert with check ((auth.jwt() ->> 'email') = 'pmmmdal.usausa@gmail.com');

create policy "gajumaru_help_articles_admin_update" on public.gajumaru_help_articles
  for update using ((auth.jwt() ->> 'email') = 'pmmmdal.usausa@gmail.com');

create policy "gajumaru_help_articles_admin_delete" on public.gajumaru_help_articles
  for delete using ((auth.jwt() ->> 'email') = 'pmmmdal.usausa@gmail.com');
