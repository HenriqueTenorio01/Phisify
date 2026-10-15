import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import published from './fixtures/published-lesson-slices.json'
import {
  waveLessons,
  waveCourse,
  waveQuestions,
} from '../content/olimpiadas/ondas'
import {
  gravityLessons,
  gravityCourse,
  gravityQuestions,
} from '../content/olimpiadas/gravitacao'
import { handbookPages as waves } from '../content/olimpiadas/ondas/reader'
import { handbookPages as gravity } from '../content/olimpiadas/gravitacao/reader'
import {
  completionIdsForLesson,
  lessonCompletion,
  resolveLessonId,
} from '../content/lesson-compatibility'
import { courseById, lessonById } from '../content/courses'
import { handbookForLesson } from '../content/handbooks'
import { progressForTrack } from '../content/catalog'
import { routeFromLocation } from '../src/app/navigation'
import { completeLessonProgress } from '../src/app/lessonProgress'
import { emptyProgress } from '../src/app/storage'
import { AppContext, type AppContextValue } from '../src/app/context'
import { CoursePage } from '../src/pages/CoursePage'
import type { SourceSlice } from '../src/app/handbook'
import type { ProgressState } from '../src/app/types'

const catalogs = [
  {
    course: waveCourse,
    lessons: waveLessons,
    questions: waveQuestions,
    pages: waves,
  },
  {
    course: gravityCourse,
    lessons: gravityLessons,
    questions: gravityQuestions,
    pages: gravity,
  },
]
const expand = (refs: SourceSlice[], pages: typeof waves) =>
  refs.flatMap((ref) => {
    const blocks = pages[ref.page]!
    return blocks
      .slice(ref.start ?? 0, ref.end)
      .map((_, i) => `${ref.page}:${(ref.start ?? 0) + i}`)
  })

test('grouped lessons contain exactly their published parts, with no removed or duplicated content', () => {
  assert.equal(published.length, 80)
  for (const { course, lessons, pages } of catalogs) {
    const source = published.filter((l) => l.course === course.id)
    assert.deepEqual(
      lessons.flatMap((l) => l.previousIds).sort(),
      source.map((l) => l.id).sort(),
    )
    const theory = new Set<string>()
    for (const lesson of lessons) {
      const expected = lesson.previousIds.flatMap((id) =>
        expand(source.find((l) => l.id === id)!.refs, pages),
      )
      const actual = expand(lesson.refs, pages)
      assert.deepEqual(actual, expected, lesson.id)
      assert.equal(
        new Set(actual).size,
        actual.length,
        `Duplicate content in ${lesson.id}`,
      )
      for (const block of actual.filter((ref) => ref.startsWith('aula-'))) {
        assert.ok(
          !theory.has(block),
          `Theory repeated across lessons: ${block}`,
        )
        theory.add(block)
      }
    }
  }
})

test('standard readings have 1–2 pages and advanced readings at most four, with the guide estimate explicit', () => {
  const advanced = new Set([
    'olymp-waves-acoplados',
    'olymp-waves-gabarito',
    'olymp-gravity-efetivo',
    'olymp-gravity-geometria',
    'olymp-gravity-estrategia',
  ])
  for (const { lessons } of catalogs)
    for (const lesson of lessons) {
      assert.ok(lesson.pages >= 1 && lesson.pages <= 4, lesson.id)
      if (!advanced.has(lesson.id)) assert.ok(lesson.pages <= 2, lesson.id)
      if (lesson.estimatedPages) {
        assert.ok(lesson.id.endsWith('-guia'))
        assert.equal(lesson.pages, 2)
        assert.ok(lesson.previousIds.some((id) => id.endsWith('-treino')))
      } else
        assert.equal(
          lesson.pages,
          new Set(lesson.refs.map((r) => r.page)).size,
          lesson.id,
        )
    }
})

test('every historical URL and question reaches its current lesson without publishing duplicate entries', () => {
  for (const old of published) {
    const id = resolveLessonId(old.id)
    const found = lessonById(old.id)!
    assert.equal(found.data.id, id)
    assert.equal(found.course.id, old.course)
    assert.equal(handbookForLesson(old.id)?.course.id, old.course)
    assert.equal(
      routeFromLocation(`/trilhas/olimpiadas/aulas/${old.id}`)?.lessonId,
      id,
    )
    const links = found.course.units.flatMap((unit) => unit.lessons)
    assert.equal(links.filter((l) => l.id === id).length, 1)
  }
  for (const { questions, course, lessons } of catalogs)
    for (const q of questions) {
      assert.ok(lessons.some((l) => l.id === q.lessonId))
      assert.equal(lessonById(q.lessonId)?.course.id, course.id)
      assert.equal(resolveLessonId(q.lessonId), q.lessonId)
    }
  assert.equal(lessonById('lesson-free-fall'), null)
  assert.equal(lessonById('unknown'), null)
  assert.equal(resolveLessonId('olymp-cm-geometria'), 'olymp-cm-geometria')
})

test('historical partial progress is preserved, never falsely completing a larger reading', () => {
  for (const { lessons, course } of catalogs)
    for (const lesson of lessons) {
      for (let count = 0; count <= lesson.previousIds.length; count++) {
        const stored: ProgressState = {
          ...emptyProgress(),
          completedLessons: [
            ...lesson.previousIds.slice(0, count),
            'saved-unknown-id',
          ],
          responses: {
            'olymp-waves-q01': { selected: 1, correct: true, at: 5 },
          },
          history: lesson.previousIds.slice(0, count).map((id) => ({
            type: 'lesson',
            label: 'Título anterior',
            contentId: id,
            at: 5,
          })),
        }
        const before = structuredClone(stored)
        const visible = progressForTrack(stored, course.trackId)
        assert.deepEqual(lessonCompletion(stored.completedLessons, lesson.id), {
          completed: count,
          total: lesson.previousIds.length,
        })
        assert.equal(
          visible.completedLessons.includes(lesson.id),
          count === lesson.previousIds.length,
          `${lesson.id}, ${count} parts`,
        )
        assert.equal(visible.history.length, count)
        assert.deepEqual(
          visible.responses['olymp-waves-q01'],
          stored.responses['olymp-waves-q01'],
        )
        assert.deepEqual(
          stored,
          before,
          'Catalog reading must not rewrite storage',
        )
        assert.deepEqual(
          progressForTrack(stored, 'ensino-medio').completedLessons,
          [],
        )
        assert.deepEqual(
          progressForTrack(stored, 'universidade').completedLessons,
          [],
        )
      }
    }
  const all = {
    ...emptyProgress(),
    completedLessons: published.map((l) => l.id),
  }
  assert.equal(
    progressForTrack(all, 'olimpiadas').completedLessons.length,
    waveLessons.length + gravityLessons.length,
  )
})

test('completing a grouped reading fills missing historical parts, preserves answers and is idempotent', () => {
  const lesson = waveLessons.find((l) => l.id === 'olymp-waves-equacao')!
  const stored: ProgressState = {
    ...emptyProgress(),
    completedLessons: [lesson.id, 'olymp-cm-geometria'],
    responses: { 'olymp-gravity-q18': { selected: 0, correct: false, at: 3 } },
    history: [
      {
        type: 'answer',
        label: 'Resposta anterior',
        contentId: 'olymp-gravity-q18',
        at: 3,
      },
    ],
  }
  const before = structuredClone(stored)
  const result = completeLessonProgress(
    stored,
    'olymp-waves-cauchy',
    lesson.title,
    7,
  )
  assert.deepEqual(stored, before)
  assert.ok(
    completionIdsForLesson(lesson.id).every((id) =>
      result.completedLessons.includes(id),
    ),
  )
  assert.ok(result.completedLessons.includes('olymp-cm-geometria'))
  assert.equal(
    result.completedLessons.length,
    new Set(result.completedLessons).size,
  )
  assert.strictEqual(result.responses, stored.responses)
  assert.deepEqual(result.history[1], stored.history[0])
  assert.equal(result.history[0]!.contentId, lesson.id)
  assert.ok(
    progressForTrack(result, 'olimpiadas').completedLessons.includes(lesson.id),
  )
  assert.strictEqual(
    completeLessonProgress(result, lesson.id, lesson.title, 8),
    result,
  )
  const solo = completeLessonProgress(
    result,
    'olymp-cm-dinamica',
    'Centro de Massa',
    9,
  )
  assert.ok(solo.completedLessons.includes('olymp-cm-dinamica'))
  assert.deepEqual(
    lessonCompletion(solo.completedLessons, 'olymp-cm-dinamica'),
    { completed: 1, total: 1 },
  )
})

test('the real course page displays preserved partial progress and marks completion only after all parts', () => {
  const course = courseById('olympiad-waves')!
  const lesson = waveLessons.find((l) => l.id === 'olymp-waves-equacao')!
  const show = (raw: ProgressState) => {
    const value: AppContextValue = {
      route: {
        trackId: 'olimpiadas',
        screen: 'course',
        courseId: course.id,
        lessonId: '',
        labId: 'waves',
        sheetId: null,
      },
      progress: progressForTrack(raw, 'olimpiadas'),
      navigate() {},
      selectTrack() {},
      openCourse() {},
      openLesson() {},
      openSheet() {},
      openLab() {},
      completeLesson() {},
      answerQuestion: async () => {},
      streak: 0,
      lessonCompletion: (id) => lessonCompletion(raw.completedLessons, id),
    }
    return renderToStaticMarkup(
      createElement(AppContext.Provider, { value }, createElement(CoursePage)),
    )
  }
  const partial = { ...emptyProgress(), completedLessons: [lesson.id] }
  const html = show(partial)
  assert.ok(html.includes('1 de 2 trechos já concluídos'))
  assert.ok(
    html.includes('<strong>2%</strong>'),
    'Keep the historical 1/42 progress percentage',
  )
  assert.ok(!html.includes('lesson-state done'))
  const complete = completeLessonProgress(partial, lesson.id, lesson.title, 10)
  const updated = show(complete)
  assert.ok(!updated.includes('1 de 2 trechos já concluídos'))
  assert.equal((updated.match(/lesson-state done/g) ?? []).length, 1)
})

test('grading and source statement/solution slices are unchanged by the regrouping', () => {
  const hashes = JSON.parse(
    readFileSync(
      new URL('fixtures/published-question-hashes.json', import.meta.url),
      'utf8',
    ),
  ) as Record<string, string>
  for (const { course, questions } of catalogs) {
    assert.equal(questions.length, 20)
    assert.equal(new Set(questions.map((q) => q.id)).size, 20)
    assert.ok(
      questions.every((q) => q.course === course.id && q.kind === 'written'),
    )
    for (const question of questions) {
      const { lessonId: _lessonId, ...unchanged } = question
      assert.equal(
        createHash('sha256').update(JSON.stringify(unchanged)).digest('hex'),
        hashes[question.id],
        question.id,
      )
    }
  }
})
