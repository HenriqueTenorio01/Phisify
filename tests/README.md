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

The Ondulatória checks in `waves.test.ts` validate both supplied PDF hashes,
coverage of all 68 instructional pages, vector assets, all 20 full written
exercises and their solutions, continuity across page breaks and separation of
Ensino Médio, Olimpíadas and Universidade. Course maintenance and regeneration
are documented in `content/olimpiadas/ondas/README.md`.

`gravity.test.ts` checks both gravitation PDF hashes, all 60 instructional
pages and original blocks, nine diagrams, 20 complete statements/solutions,
cross-page deductions and independent worksheet URLs. It also covers PDF
inline-root fragments that must reflow as one paragraph without duplication.
Regeneration is documented in `content/olimpiadas/gravitacao/README.md`.

`center-of-mass.test.ts` checks the two center-of-mass PDFs, all 52 instructional
pages and 1,450 original blocks, 13 diagrams, 14 complete questions/solutions and
their individual optional hints. It enforces 1–2 source pages for standard lessons
and at most four for advanced work, with no duplicated theory or interrupted
sections, plus the compact topic and independent worksheet route.
Regeneration is documented in `content/olimpiadas/centro-de-massa/README.md`.
