-- ガジュマル 管理人向け: 登録ユーザー数を確認する関数
-- auth.usersはクライアントから直接読めないため、管理人メールのみ実行できる
-- SECURITY DEFINER関数経由でカウントだけを返す

create or replace function public.admin_user_count()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  result integer;
begin
  if (auth.jwt() ->> 'email') is distinct from 'pmmmdal.usausa@gmail.com' then
    raise exception 'not authorized';
  end if;

  select count(*) into result from auth.users;
  return result;
end;
$$;

grant execute on function public.admin_user_count() to authenticated;
