import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  mechanicsCourse,
  mechanicsLessons,
  mechanicsQuestions,
  mechanicsTopics,
} from '../content/ensino-medio/mecanica'
import {
  handbookPages,
  resolveSource,
} from '../content/ensino-medio/mecanica/reader'
import {
  coursesForTrack,
  questionsForTrack,
  progressForTrack,
} from '../content/catalog'
import { worksheetsForTrack } from '../content/worksheets'
import { routeFromLocation } from '../src/app/navigation'
import { emptyProgress } from '../src/app/storage'
import { completeLessonProgress } from '../src/app/lessonProgress'
import type { SourceSlice } from '../src/app/handbook'
const root = new URL('../', import.meta.url)
const json = (file: string) =>
  JSON.parse(
    readFileSync(
      new URL('content/ensino-medio/mecanica/' + file + '.json', root),
      'utf8',
    ),
  )
const coverage = json('coverage')
const structural: SourceSlice[] = json('structural-headings')
const text = (refs: SourceSlice[]) =>
  resolveSource(refs)
    .map((b) => b.text)
    .join(' ')

test('mechanics preserves all 136 instructional pages and every source block exactly once', () => {
  assert.equal(coverage.pages.length, 136)
  for (const source of coverage.sources)
    assert.equal(
      createHash('sha256')
        .update(
          readFileSync(new URL('materiais/referencias/' + source.file, root)),
        )
        .digest('hex'),
      source.sha256,
    )
  const occurrences = new Map<string, number>()
  const collect = (refs: SourceSlice[]) =>
    refs.forEach((ref) => {
      const blocks = handbookPages[ref.page]!
      assert.ok(blocks, ref.page)
      for (let i = ref.start ?? 0; i < (ref.end ?? blocks.length); i++) {
        const key = ref.page + ':' + i
        occurrences.set(key, (occurrences.get(key) ?? 0) + 1)
      }
    })
  mechanicsLessons.forEach((l) => collect(l.refs))
  mechanicsQuestions.forEach((q) => {
    collect(q.statement)
    collect(q.solution)
  })
  collect(structural)
  for (const p of coverage.pages) {
    assert.equal(p.sourceBlocks, p.coveredBlocks)
    const key = `${p.document}-${p.page}`
    assert.equal(
      new Set(handbookPages[key]!.flatMap((b) => b.source.blocks)).size,
      p.sourceBlocks,
      key,
    )
    handbookPages[key]!.forEach((_, i) =>
      assert.equal(occurrences.get(key + ':' + i), 1, key + ':' + i),
    )
  }
})

test('all school equations and 24 diagrams resolve without embedding PDF pages', () => {
  const files = new Map<string, string>()
  let figures = 0
  for (const blocks of Object.values(handbookPages))
    for (const block of blocks) {
      if (block.type === 'figure') figures++
      for (const image of [
        block.image,
        ...(block.runs ?? []).map((r) => r.math),
      ].filter(Boolean)) {
        const [file, id] = image!.src.split('#')
        if (!files.has(file!))
          files.set(file!, readFileSync(new URL('public' + file, root), 'utf8'))
        assert.ok(image!.width > 0 && image!.height > 0)
        assert.ok(
          file!.startsWith('/mecanica-em/') &&
            id &&
            files.get(file!)!.includes(`id="${id}"`),
          image!.src,
        )
        assert.ok(
          !/<script|foreignObject|<image|\.pdf/i.test(files.get(file!)!),
        )
      }
      if (block.mathml)
        assert.ok(
          !/<script|href|onload|style=|annotation|foreignObject/i.test(
            block.mathml,
          ),
        )
    }
  assert.equal(figures, 24)
})

test('school readings add conceptual explanation, retain 40 examples and keep ongoing deductions together', () => {
  assert.equal(mechanicsLessons.length, 47)
  assert.equal(mechanicsCourse.units.length, 9)
  const exampleNumbers: number[] = []
  for (const lesson of mechanicsLessons) {
    assert.ok(lesson.pages! >= 1 && lesson.pages! <= 4)
    for (const b of resolveSource(lesson.refs)) {
      const example = /^Exemplo resolvido (\d+)/.exec(b.text)
      if (b.type === 'heading' && example)
        exampleNumbers.push(Number(example[1]))
    }
    if (lesson.refs[0]!.page.startsWith('complemento-')) {
      const supplement = resolveSource([lesson.refs[0]!])
      assert.ok(supplement.filter((b) => b.type === 'paragraph').length >= 4)
      assert.ok(
        supplement.reduce((sum, b) => sum + b.text.length, 0) > 1000,
        lesson.id,
      )
      assert.equal(lesson.estimatedPages, true)
    }
  }
  assert.deepEqual(
    exampleNumbers.sort((a, b) => a - b),
    Array.from({ length: 40 }, (_, i) => i + 1),
  )
  const body = (slug: string) =>
    text(mechanicsLessons.find((l) => l.id === 'hs-mech-' + slug)!.refs)
  assert.ok(body('medidas').includes('A unidade sai da divisão'))
  assert.ok(!body('vetores').includes('A unidade sai da divisão'))
  assert.ok(body('mruv').includes('Nesse exemplo, de 0 a 2 s'))
  assert.ok(body('pressao').includes('Em um manômetro de líquido único'))
  assert.ok(body('bernoulli').includes('Equação de Bernoulli'))
  assert.ok(body('torricelli').includes('12.5 Bombas'))
  const flowEquations = handbookPages['aula-46']!.filter(
    (b) => b.type === 'equation',
  )
  assert.ok(flowEquations.some((b) => b.text.includes('Q = ∆V∆t')))
  assert.ok(!flowEquations.some((b) => b.text === '∆t .'))
  assert.ok(
    handbookPages['aula-38']!.some(
      (b) => b.type === 'equation' && b.text.includes('a = rmin + rmax2'),
    ),
  )
  assert.ok(
    !handbookPages['aula-38']!.some(
      (b) => b.type === 'equation' && b.text === '2.',
    ),
  )
})

test('90 complete questions keep their own statements, solutions, original difficulties and thematic partitions', () => {
  assert.equal(mechanicsQuestions.length, 90)
  assert.deepEqual(
    ['easy', 'medium', 'hard'].map(
      (d) => mechanicsQuestions.filter((q) => q.difficulty === d).length,
    ),
    [60, 24, 6],
  )
  assert.deepEqual(
    mechanicsTopics
      .filter((t) => t.id !== 'consulta')
      .map((t) => mechanicsQuestions.filter((q) => q.topicId === t.id).length),
    [6, 20, 32, 6, 6, 8, 6, 6],
  )
  for (const q of mechanicsQuestions) {
    const statements = resolveSource(q.statement),
      solutions = resolveSource(q.solution)
    assert.equal(statements[0]!.text, q.prompt)
    assert.equal(solutions[0]!.text, q.prompt)
    assert.ok(text(q.statement).includes('(a)'), q.id)
    assert.ok(
      text(q.solution).includes('Resultado.') &&
        text(q.solution).includes('Caminho.'),
      q.id,
    )
    assert.ok(
      mechanicsLessons.some((l) => l.id === q.lessonId),
      q.id,
    )
    assert.equal(
      statements.filter((b) => /^Questão \d+/.test(b.text)).length,
      1,
    )
    assert.equal(solutions.filter((b) => /^Questão \d+/.test(b.text)).length, 1)
  }
})

test('theme URLs reload independently and new school progress stays isolated from olympiads and retired content', () => {
  const sheet = worksheetsForTrack('ensino-medio').find(
    (s) => s.id === 'mechanics',
  )!
  assert.equal(sheet.topics!.length, 8)
  for (const t of sheet.topics!) {
    assert.equal(
      routeFromLocation(
        '/trilhas/ensino-medio/questoes/mecanica',
        '?tema=' + t.id,
      )?.topicId,
      t.id,
    )
    assert.equal(
      routeFromLocation(
        '/trilhas/ensino-medio/cursos/mechanics',
        '?tema=' + t.id,
      )?.topicId,
      t.id,
    )
  }
  assert.equal(
    routeFromLocation('/trilhas/olimpiadas/questoes/mecanica')?.sheetId,
    'unavailable',
  )
  for (const track of ['olimpiadas', 'universidade'] as const) {
    assert.ok(!coursesForTrack(track).some((c) => c.id === 'mechanics'))
    assert.ok(!questionsForTrack(track).some((q) => q.course === 'mechanics'))
  }
  const raw = {
    ...emptyProgress(),
    completedLessons: [
      'hs-mech-mruv',
      'lesson-free-fall',
      'olymp-cm-geometria',
    ],
    responses: {
      'hs-mech-q11': { selected: 1, correct: true, at: 1 },
      'q-free-fall': { selected: 1, correct: true, at: 1 },
    },
  }
  const visible = progressForTrack(raw, 'ensino-medio')
  assert.deepEqual(visible.completedLessons, ['hs-mech-mruv'])
  assert.deepEqual(Object.keys(visible.responses), ['hs-mech-q11'])
  assert.deepEqual(completeLessonProgress(raw, 'hs-mech-mruv', 'MRUV', 2), raw)
  const advanced = completeLessonProgress(
    raw,
    'hs-mech-vertical',
    'Vertical',
    2,
  )
  assert.deepEqual(advanced.completedLessons, [
    ...raw.completedLessons,
    'hs-mech-vertical',
  ])
  assert.deepEqual(advanced.responses, raw.responses)
  assert.equal(advanced.history[0]!.contentId, 'hs-mech-vertical')
  assert.equal(
    completeLessonProgress(advanced, 'hs-mech-vertical', 'Vertical', 3),
    advanced,
  )
})
