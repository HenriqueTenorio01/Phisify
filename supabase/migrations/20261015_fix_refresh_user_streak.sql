-- refresh_user_streak has no question argument. The stray initializer raised
-- undefined_column on every call, including calls from record_question_completion.
-- Keep the existing rule: three distinct exercises complete a day; only a run
-- ending today counts as current_streak.
create or replace function public.refresh_user_streak()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_timezone text;
  v_activity_date date;
  v_previous_date date;
  v_run integer := 0;
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_profile public.profiles%rowtype;
  v_row record;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select coalesce(nullif(timezone, ''), 'UTC') into v_timezone
  from public.profiles
  where id = v_user_id;

  if v_timezone is null then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  v_activity_date := (now() at time zone v_timezone)::date;

  for v_row in
    select activity_date
    from public.user_daily_activity
    where user_id = v_user_id
      and streak_day_completed
    order by activity_date
  loop
    if v_previous_date is null or v_row.activity_date = v_previous_date + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;

    v_longest_streak := greatest(v_longest_streak, v_run);
    if v_row.activity_date = v_activity_date then
      v_current_streak := v_run;
    end if;
    v_previous_date := v_row.activity_date;
  end loop;

  update public.profiles
  set current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return jsonb_build_object(
    'current_streak', v_profile.current_streak,
    'longest_streak', v_profile.longest_streak
  );
end;
$$;

revoke execute on function public.refresh_user_streak() from public, anon;
grant execute on function public.refresh_user_streak() to authenticated;
