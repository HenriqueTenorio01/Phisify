revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_update() from public, anon, authenticated;

revoke execute on function public.set_user_timezone(text) from public, anon;
grant execute on function public.set_user_timezone(text) to authenticated;

revoke execute on function public.refresh_user_streak() from public, anon;
grant execute on function public.refresh_user_streak() to authenticated;

revoke execute on function public.record_question_completion(text, boolean) from public, anon;
grant execute on function public.record_question_completion(text, boolean) to authenticated;

