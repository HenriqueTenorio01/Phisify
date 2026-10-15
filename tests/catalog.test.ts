import { test } from 'node:test'
import assert from 'node:assert/strict'
import { courses, courseById, lessonById } from '../content/courses'
import { lessonDataById, academicLessons } from '../content/lessons'
import { questionBank } from '../content/questions'
import { tracks } from '../content/tracks'
import {
  coursesForTrack,
  progressForTrack,
  questionsForTrack,
} from '../content/catalog'
import { emptyProgress } from '../src/app/storage'
import { routeFromLocation, screenPath } from '../src/app/navigation'
import { searchContent } from '../src/search'

test('retired lessons/questions cannot be discovered; simulations remain searchable', () => {
  assert.ok(courses.length > 0, 'preserve course infrastructure')
  assert.deepEqual(lessonDataById, {})
  assert.deepEqual(academicLessons, {})
  assert.ok(
    courses
      .flatMap((c) => c.units.flatMap((u) => u.lessons))
      .every((l) => l.id !== 'lesson-free-fall'),
  )
  assert.ok(questionBank.every((q) => q.id !== 'q-free-fall'))
  assert.equal(lessonById('lesson-free-fall'), null)
  assert.equal(courseById('unknown'), undefined)
  for (const { id } of tracks) {
    const found = searchContent('ondas', id)
    if (id !== 'olimpiadas') {
      assert.deepEqual(found.lessons, [])
      assert.deepEqual(found.questions, [])
    }
    assert.ok(found.labs.length > 0)
    assert.ok(coursesForTrack(id).every((course) => course.trackId === id))
    assert.ok(
      questionsForTrack(id).every((q) => courseById(q.course)?.trackId === id),
    )
  }
})

test('retired progress stays in storage data but is absent from each track experience', () => {
  const saved = {
    ...emptyProgress(),
    completedLessons: ['lesson-free-fall'],
    responses: { 'q-free-fall': { selected: 1, correct: true, at: 1 } },
    history: [{ label: 'Queda livre', type: 'lesson' as const, at: 1 }],
  }
  const before = structuredClone(saved)
  for (const { id } of tracks)
    assert.deepEqual(progressForTrack(saved, id), emptyProgress())
  assert.deepEqual(saved, before)
})

test('each track has independent routes that survive refresh and browser history', () => {
  for (const { id } of tracks) {
    for (const screen of [
      'courses',
      'sheets',
      'review',
      'performance',
      'search',
    ] as const) {
      const path = screenPath(screen, id)!
      assert.equal(routeFromLocation(path)?.trackId, id)
      assert.equal(routeFromLocation(path)?.screen, screen)
      assert.equal(routeFromLocation(path + '/')?.trackId, id)
    }
  }
  assert.deepEqual(routeFromLocation('/?ignored'), null)
  assert.deepEqual(routeFromLocation('/', '?auth=recovery'), {
    screen: 'recovery',
  })
  assert.equal(
    routeFromLocation('/laboratorio/interferencia-de-ondas')?.labId,
    'waves',
  )
  assert.equal(routeFromLocation('/trilhas/not-a-track'), null)
})

test('future content and progress are isolated by track', () => {
  // Catalog fixtures only: no educational content is published by this test.
  const fixtureCourse = {
    ...courses[0]!,
    id: 'fixture-university' as (typeof courses)[number]['id'],
    trackId: 'universidade' as const,
    units: [
      {
        title: 'Fixture',
        lessons: [
          {
            id: 'fixture-lesson',
            title: 'Fixture',
            description: '',
            type: 'Aula',
            minutes: 1,
          },
        ],
      },
    ],
  }
  const fixtureQuestion = {
    id: 'fixture-question',
    course: fixtureCourse.id,
    lessonId: 'fixture-lesson',
    topic: 'Fixture',
    difficulty: 'easy' as const,
    objective: '',
    format: '',
    prompt: '',
    options: [],
    answer: 0,
    reasoning: '',
    explanation: '',
  }
  courses.push(fixtureCourse)
  questionBank.push(fixtureQuestion)
  try {
    const progress = {
      ...emptyProgress(),
      completedLessons: ['fixture-lesson', 'lesson-free-fall'],
      responses: { 'fixture-question': { selected: 0, correct: true, at: 1 } },
      history: [
        {
          type: 'lesson' as const,
          label: 'Fixture',
          at: 1,
          contentId: 'fixture-lesson',
        },
      ],
    }
    assert.deepEqual(
      progressForTrack(progress, 'ensino-medio'),
      emptyProgress(),
    )
    assert.deepEqual(progressForTrack(progress, 'olimpiadas'), emptyProgress())
    const university = progressForTrack(progress, 'universidade')
    assert.deepEqual(university.completedLessons, ['fixture-lesson'])
    assert.deepEqual(Object.keys(university.responses), ['fixture-question'])
    assert.equal(university.history.length, 1)
    assert.equal(searchContent('Fixture', 'universidade').lessons.length, 1)
    assert.equal(searchContent('Fixture', 'olimpiadas').lessons.length, 0)
    assert.ok(
      !questionsForTrack('ensino-medio').some(
        (q) => q.id === 'fixture-question',
      ),
    )
  } finally {
    courses.pop()
    questionBank.pop()
  }
})
