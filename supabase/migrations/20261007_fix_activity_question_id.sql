create or replace function public.set_user_timezone(p_timezone text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_timezone text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select name into v_timezone
  from pg_timezone_names
  where name = nullif(trim(p_timezone), '');

  if v_timezone is null then
    v_timezone := 'UTC';
  end if;

  update public.profiles
  set timezone = v_timezone,
      updated_at = now()
  where id = v_user_id;

  return v_timezone;
end;
$$;

create or replace function public.record_question_completion(
  p_question_id text,
  p_is_correct boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question_id text := trim(p_question_id);
  v_timezone text;
  v_activity_date date;
  v_activity public.user_daily_activity%rowtype;
  v_profile public.profiles%rowtype;
  v_was_new_completion boolean := false;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if nullif(v_question_id, '') is null then
    raise exception 'question_id_required' using errcode = '22023';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id;

  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  v_timezone := coalesce(nullif(v_profile.timezone, ''), 'UTC');
  v_activity_date := (now() at time zone v_timezone)::date;

  insert into public.user_daily_activity (user_id, activity_date)
  values (v_user_id, v_activity_date)
  on conflict (user_id, activity_date) do nothing;

  select * into v_activity
  from public.user_daily_activity
  where user_id = v_user_id
    and activity_date = v_activity_date
  for update;

  if not (v_question_id = any(v_activity.completed_exercise_ids)) then
    v_was_new_completion := true;

    update public.user_daily_activity
    set exercises_completed = exercises_completed + 1,
        completed_exercise_ids = array_append(completed_exercise_ids, v_question_id),
        streak_day_completed = exercises_completed + 1 >= 3,
        updated_at = now()
    where id = v_activity.id
    returning * into v_activity;

    update public.profiles
    set questions_answered = questions_answered + 1,
        questions_correct = questions_correct + case when p_is_correct then 1 else 0 end,
        updated_at = now()
    where id = v_user_id;
  end if;

  perform public.refresh_user_streak();
  select * into v_profile from public.profiles where id = v_user_id;

  return jsonb_build_object(
    'activity_date', v_activity_date,
    'exercises_completed', v_activity.exercises_completed,
    'streak_day_completed', v_activity.streak_day_completed,
    'new_completion', v_was_new_completion,
    'current_streak', v_profile.current_streak,
    'longest_streak', v_profile.longest_streak,
    'questions_answered', v_profile.questions_answered,
    'questions_correct', v_profile.questions_correct
  );
end;
$$;

revoke execute on function public.set_user_timezone(text) from public, anon;
grant execute on function public.set_user_timezone(text) to authenticated;
revoke execute on function public.record_question_completion(text, boolean) from public, anon;
grant execute on function public.record_question_completion(text, boolean) to authenticated;

