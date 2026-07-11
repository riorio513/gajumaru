-- 登録ユーザー数から、開発中に作成した管理人・テスト用アカウント分(3件)を除外する
-- 現時点の実利用者数を0人として、以降の新規登録分だけをカウントする

create or replace function public.admin_user_count()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  total integer;
  baseline constant integer := 3;
  result integer;
begin
  if (auth.jwt() ->> 'email') is distinct from 'pmmmdal.usausa@gmail.com' then
    raise exception 'not authorized';
  end if;

  select count(*) into total from auth.users;
  result := total - baseline;
  if result < 0 then
    result := 0;
  end if;
  return result;
end;
$$;

grant execute on function public.admin_user_count() to authenticated;
