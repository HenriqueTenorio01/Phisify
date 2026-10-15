import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  coursesForTrack,
  progressForTrack,
  questionsForTrack,
} from '../content/catalog'
import {
  waveCourse,
  waveLessons,
  waveQuestions,
} from '../content/olimpiadas/ondas'
import {
  handbookPages,
  resolveSource,
} from '../content/olimpiadas/ondas/reader'
import type { SourceSlice } from '../src/app/handbook'
import { emptyProgress } from '../src/app/storage'

const root = new URL('../', import.meta.url)
const coverage = JSON.parse(
  readFileSync(new URL('content/olimpiadas/ondas/coverage.json', root), 'utf8'),
)
const structural = JSON.parse(
  readFileSync(
    new URL('content/olimpiadas/ondas/structural-headings.json', root),
    'utf8',
  ),
) as SourceSlice[]

test('all instructional pages and blocks are represented by lessons, exercises or their structural headings', () => {
  assert.equal(coverage.pages.length, 68)
  for (const source of coverage.sources) {
    const pdf = readFileSync(
      new URL(`materiais/referencias/${source.file}`, root),
    )
    assert.equal(createHash('sha256').update(pdf).digest('hex'), source.sha256)
  }
  assert.ok(
    coverage.pages.every(
      (p: { sourceBlocks: number; coveredBlocks: number }) =>
        p.sourceBlocks === p.coveredBlocks,
    ),
  )
  const used = new Set<string>()
  const collect = (refs: SourceSlice[]) =>
    refs.forEach((ref) => {
      assert.ok(handbookPages[ref.page], ref.page)
      for (
        let i = ref.start ?? 0;
        i < (ref.end ?? handbookPages[ref.page]!.length);
        i++
      )
        used.add(`${ref.page}:${i}`)
    })
  waveLessons.forEach((lesson) => collect(lesson.refs))
  waveQuestions.forEach((question) => {
    collect(question.statement)
    collect(question.solution)
  })
  collect(structural)
  for (const [page, blocks] of Object.entries(handbookPages)) {
    blocks.forEach((_, i) =>
      assert.ok(used.has(`${page}:${i}`), `Unmapped source block ${page}:${i}`),
    )
  }
})

test('every vector expression and figure resolves to a valid isolated symbol', () => {
  const files = new Map<string, string>()
  let equations = 0,
    figures = 0,
    inline = 0
  for (const blocks of Object.values(handbookPages))
    for (const block of blocks) {
      if (block.type === 'equation') equations++
      if (block.type === 'figure') figures++
      const images = [
        block.image,
        ...(block.runs ?? []).map((run) => run.math),
      ].filter(Boolean)
      inline += (block.runs ?? []).filter((run) => run.math).length
      for (const image of images) {
        assert.ok(image!.width > 0 && image!.height > 0)
        const [file, fragment] = image!.src.split('#')
        assert.ok(fragment)
        if (!files.has(file!)) {
          const path = new URL(`public${file}`, root)
          assert.ok(existsSync(path), file)
          files.set(file!, readFileSync(path, 'utf8'))
        }
        const svg = files.get(file!)!
        assert.ok(svg.includes(`id="${fragment}"`), image!.src)
        assert.ok(!/<script|foreignObject|<image|\.pdf/i.test(svg))
      }
    }
  assert.ok(equations > 180, `Only ${equations} display blocks`)
  assert.equal(figures, 8)
  assert.ok(inline > 1000)
  assert.equal(files.size, 68)
})

test('all 20 written problems retain their complete subquestions and detailed solutions', () => {
  assert.equal(waveQuestions.length, 20)
  assert.equal(
    waveQuestions.filter((question) => question.difficulty === 'easy').length,
    12,
  )
  assert.equal(
    waveQuestions.filter((question) => question.difficulty === 'medium').length,
    6,
  )
  assert.equal(
    waveQuestions.filter((question) => question.difficulty === 'hard').length,
    2,
  )
  const solutionEndings = [
    'essas duas velocidades.',
    'no enunciado.',
    'única onda viajante.',
    'detector especificado.',
    'janela longa de medida.',
    'não quatro vezes.',
    'falsa perda de energia.',
    'não amplitude local.',
    '200, 400, 600 Hz.',
    'depende apenas dela.',
    'permanece 2,0 mm.',
    'geração de energia.',
    'modais não basta.',
    'tenha um salto.',
    'frequência de projeto.',
    'deformação tolerada.',
    'incidência normal.',
    'foram pedidos.',
    'energia interna.',
    'vários modos.',
  ]
  for (let number = 1; number <= 20; number++) {
    const q = waveQuestions.find(
      (question) => question.sourceNumber === number,
    )!
    assert.equal(q.kind, 'written')
    assert.ok(waveLessons.some((lesson) => lesson.id === q.lessonId))
    const statement = resolveSource(q.statement)
      .map((block) => block.text)
      .join(' ')
    for (const part of ['(a)', '(b)', '(c)'])
      assert.ok(statement.includes(part), `Question ${number}, ${part}`)
    assert.ok(
      resolveSource(q.solution)
        .map((block) => block.text)
        .join(' ')
        .endsWith(solutionEndings[number - 1]!),
      `Solution ${number} truncated`,
    )
  }
  for (const number of [19, 20]) {
    const q = waveQuestions.find(
      (question) => question.sourceNumber === number,
    )!
    assert.equal(new Set(q.solution.map((ref) => ref.page)).size, 2)
    assert.ok(
      resolveSource(q.solution).some((block) =>
        block.text.includes('continuação'),
      ),
    )
  }
})

test('chapter boundaries preserve ongoing derivations, examples and appendix conditions', () => {
  assert.equal(waveLessons.length, 42)
  assert.equal(waveCourse.units.length, 15)
  const sound = waveLessons.find((lesson) => lesson.id.endsWith('-som'))!
  const soundText = resolveSource(sound.refs)
    .map((block) => block.text)
    .join(' ')
  assert.ok(soundText.includes('6.3 Exemplo resolvido 7'))
  assert.ok(sound.refs.some((ref) => ref.page === 'aula-17'))
  assert.ok(!soundText.includes('6.4 Excitar'))
  const modes = waveLessons.find((lesson) => lesson.id === 'olymp-waves-modos')!
  assert.ok(modes.refs.some((ref) => ref.page === 'aula-15'))
  assert.equal(
    waveLessons.filter((lesson) => lesson.unit.startsWith('13 ')).length,
    8,
  )
})

test('the olympiad course cannot leak into Ensino Médio or Universidade', () => {
  assert.equal(
    coursesForTrack('olimpiadas').find((course) => course.id === waveCourse.id)
      ?.units.length,
    15,
  )
  assert.ok(
    coursesForTrack('ensino-medio').every((course) =>
      course.units.every((unit) => !unit.lessons.length),
    ),
  )
  assert.deepEqual(questionsForTrack('ensino-medio'), [])
  assert.deepEqual(questionsForTrack('universidade'), [])
  const saved = {
    ...emptyProgress(),
    completedLessons: [waveLessons[0]!.id],
    responses: {
      [waveQuestions[0]!.id]: { selected: 1, correct: true, at: 1 },
    },
  }
  assert.deepEqual(progressForTrack(saved, 'ensino-medio'), emptyProgress())
  assert.deepEqual(progressForTrack(saved, 'universidade'), emptyProgress())
  assert.equal(progressForTrack(saved, 'olimpiadas').completedLessons.length, 1)
})

test('written exercise results use explicit self-assessment and keep multiple-choice grading intact', async () => {
  const { isResponseCorrect } = await import('../src/questions')
  const question = waveQuestions[0]!
  assert.equal(isResponseCorrect(question, 1), true)
  assert.equal(isResponseCorrect(question, 0), false)
  assert.equal(isResponseCorrect(question, 2), false)
  const choice = {
    ...question,
    kind: 'choice' as const,
    options: ['A', 'B'],
    answer: 0,
    explanation: 'Fixture',
  }
  assert.equal(isResponseCorrect(choice, 0), true)
  assert.equal(isResponseCorrect(choice, 1), false)
})
