# Regression checks

Run from the repository root with Node 24. The repository has no existing test runner
and its committed npm lockfile is inconsistent. Install test-only tools outside the
checkout so these regression checks do not change the app's dependencies or lockfile:

```sh
npm install --prefix /tmp/phisify-validation --no-save --no-package-lock tsx jsdom @electric-sql/pglite
PHISIFY_TEST_TOOLS=/tmp/phisify-validation /tmp/phisify-validation/node_modules/.bin/tsx --test tests/*.test.ts tests/*.test.mjs
npm run build
```

- `progress.test.ts` mounts the real React hook under StrictMode and checks saved
  progress on initialization, account changes, stale callbacks, logout and remount.
- `streak.test.mjs` runs all migrations on fresh in-memory PostgreSQL (PGlite),
  reproduces the old `p_question_id` error, applies the new migration twice, and
  checks counters, daily thresholds, gaps, deduplication, timezones and permissions.
  It never connects to a live Supabase project.
- `catalog.test.ts` checks retired content, preservation of historical data,
  track-specific URLs and continued laboratory search.

The new migration must also be applied through the project's normal Supabase
migration workflow for the correction to reach a remote database. Existing daily
streak behavior is preserved: only a completed run ending today counts as current.

New content belongs in the existing course, lesson and question registries. Assign
courses a `trackId` and use unique course/lesson/question IDs across tracks. The
catalog selectors scope discovery and visible progress without deleting saved data.
