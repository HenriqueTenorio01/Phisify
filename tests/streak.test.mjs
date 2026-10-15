import { requireTool } from './support/tools.mjs'
import { test } from 'node:test'
const { PGlite } = requireTool('@electric-sql/pglite')
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
test('migrations repair streak RPC and preserve scoring, timezone and permissions', async () => {
  const db = new PGlite()
  const root = new URL('../supabase/migrations/', import.meta.url) // Fresh in-memory PostgreSQL only.
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`)
  for (const file of [
    '20261004_create_profiles.sql',
    '20261007_add_daily_activity_streak.sql',
    '20261007_backfill_existing_profiles.sql',
    '20261007_fix_activity_question_id.sql',
    '20261007_harden_activity_function_permissions.sql',
  ]) {
    await db.exec(await readFile(new URL(file, root), 'utf8'))
  }
  const a = '00000000-0000-4000-8000-000000000001'
  const b = '00000000-0000-4000-8000-000000000002'
  await db.exec(
    `INSERT INTO auth.users(id) VALUES ('${a}'),('${b}'); SET request.jwt.claim.sub = '${a}';`,
  )
  await assert.rejects(
    db.query('SELECT public.refresh_user_streak()'),
    /p_question_id/,
  )
  console.log('PASS: reproduced original missing p_question_id failure')
  const fix = await readFile(
    new URL('20261015_fix_refresh_user_streak.sql', root),
    'utf8',
  )
  await db.exec(fix)
  await db.exec(fix) // replacement is repeatable
  const streak = async () =>
    (await db.query('SELECT public.refresh_user_streak() AS result')).rows[0]
      .result
  assert.deepEqual(await streak(), { current_streak: 0, longest_streak: 0 })
  await db.exec(`INSERT INTO public.user_daily_activity(user_id, activity_date, streak_day_completed)
VALUES ('${a}',CURRENT_DATE - 4,true),('${a}',CURRENT_DATE - 3,true),('${a}',CURRENT_DATE - 1,true),('${b}',CURRENT_DATE,true);`)
  assert.deepEqual(await streak(), { current_streak: 0, longest_streak: 2 })
  const answer = async (id, correct = true) =>
    (
      await db.query(
        'SELECT public.record_question_completion($1,$2) AS result',
        [id, correct],
      )
    ).rows[0].result
  let result = await answer('fixture-a')
  assert.equal(result.exercises_completed, 1)
  assert.equal(result.current_streak, 0)
  result = await answer('fixture-a')
  assert.equal(result.new_completion, false)
  assert.equal(result.questions_answered, 1)
  await answer('fixture-b', false)
  result = await answer('fixture-c')
  assert.equal(result.streak_day_completed, true)
  assert.equal(result.current_streak, 2)
  assert.equal(result.questions_answered, 3)
  assert.equal(result.questions_correct, 2)
  assert.deepEqual(await streak(), { current_streak: 2, longest_streak: 2 })
  console.log(
    'PASS: no activity, gaps, today-only current streak, threshold, deduplication, counters',
  )
  await db.exec(`SET request.jwt.claim.sub = '${b}';`)
  assert.deepEqual(await streak(), { current_streak: 1, longest_streak: 1 })
  console.log('PASS: per-user activity isolation')
  // Force local day to differ from UTC, independent of test execution time.
  const hour = new Date().getUTCHours()
  const timezone = hour < 12 ? 'Etc/GMT+12' : 'Etc/GMT-14'
  await db.query('UPDATE public.profiles SET timezone=$1 WHERE id=$2', [
    timezone,
    b,
  ])
  await db.query('DELETE FROM public.user_daily_activity WHERE user_id=$1', [b])
  for (const q of ['tz-a', 'tz-b', 'tz-c']) result = await answer(q)
  const localDay = (
    await db.query('SELECT (now() AT TIME ZONE $1)::date::text AS day', [
      timezone,
    ])
  ).rows[0].day
  assert.equal(result.activity_date, localDay)
  assert.equal(result.current_streak, 1)
  console.log('PASS: user timezone determines activity day')
  await db.exec("SET request.jwt.claim.sub = ''; SET ROLE authenticated;")
  await assert.rejects(streak, /not_authenticated/)
  await db.exec('RESET ROLE; SET ROLE anon;')
  await assert.rejects(streak, /permission denied/)
  await db.exec(
    `RESET ROLE; SET request.jwt.claim.sub = '${a}'; SET ROLE authenticated;`,
  )
  assert.equal((await streak()).current_streak, 2)
  console.log(
    'PASS: unauthenticated rejection, anonymous denial, authenticated execution',
  )
  await db.close()
})
