import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { requireTool } from './support/tools.mjs'
const { JSDOM } = requireTool('jsdom')
const requireApp = createRequire(new URL('../package.json', import.meta.url))
const { createElement, StrictMode, act } = requireApp('react')
const { createRoot } = requireApp('react-dom/client')
const { useUserProgress } = await import('../src/app/useUserProgress')
const { emptyProgress, STORAGE_KEY } = await import('../src/app/storage')
test('progress survives initialization, account switches, stale callbacks, logout and refresh', async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: 'https://phisify.test',
  })
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  })
  let value: ReturnType<typeof useUserProgress>
  function Probe({ userId, loading }: { userId?: string; loading: boolean }) {
    value = useUserProgress(userId, loading)
    return null
  }
  const key = (id: string) => `${STORAGE_KEY}:${id}`
  const a = {
    ...emptyProgress(),
    completedLessons: ['saved-a'],
    responses: { 'q-a': { selected: 1, correct: true, at: 1 } },
  }
  const b = { ...emptyProgress(), completedLessons: ['saved-b'] }
  window.localStorage.setItem(key('a'), JSON.stringify(a))
  window.localStorage.setItem(key('b'), JSON.stringify(b))
  const writes: Array<[string, string]> = []
  const prototype = Object.getPrototypeOf(window.localStorage)
  const original = prototype.setItem
  prototype.setItem = function (k: string, v: string) {
    writes.push([k, v])
    return original.call(this, k, v)
  }
  let root = createRoot(document.getElementById('root')!)
  const render = async (userId?: string, loading = false) => {
    await act(async () =>
      root.render(
        createElement(
          StrictMode,
          null,
          createElement(Probe, { userId, loading }),
        ),
      ),
    )
  }
  await render(undefined, true)
  assert.equal(writes.length, 0)
  await render('a', false)
  assert.deepEqual(value!.progress, a)
  assert.ok(
    writes
      .filter(([k]) => k === key('a'))
      .every(([, v]) => JSON.stringify(a) === v),
    'no empty write on initialization',
  )
  console.log(
    'PASS: auth initialization preserves existing progress in StrictMode',
  )
  const staleSetA = value!.setProgress
  writes.length = 0
  await render('b', false)
  assert.deepEqual(value!.progress, b)
  assert.ok(
    writes.every(([k, v]) => k === key('b') && v === JSON.stringify(b)),
    'never write user A progress to B',
  )
  await act(async () =>
    staleSetA({ ...emptyProgress(), completedLessons: ['stale'] }),
  )
  assert.deepEqual(value!.progress, b)
  console.log('PASS: account switch is isolated and stale updates are rejected')
  await act(async () =>
    value!.setProgress((p) => ({
      ...p,
      completedLessons: [...p.completedLessons, 'new-b'],
    })),
  )
  assert.deepEqual(
    JSON.parse(window.localStorage.getItem(key('b'))!).completedLessons,
    ['saved-b', 'new-b'],
  )
  await render(undefined, false)
  assert.deepEqual(value!.progress, emptyProgress())
  assert.deepEqual(JSON.parse(window.localStorage.getItem(key('a'))!), a)
  await render('a', false)
  assert.deepEqual(value!.progress, a)
  console.log(
    'PASS: normal persistence, logout and login restore the correct account',
  )
  await act(async () => root.unmount())
  root = createRoot(document.getElementById('root')!)
  await render('b', false)
  assert.deepEqual(value!.progress.completedLessons, ['saved-b', 'new-b'])
  await act(async () => root.unmount())
  console.log('PASS: remount/refresh restores saved progress')
})
