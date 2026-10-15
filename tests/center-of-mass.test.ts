import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  centerOfMassCourse,
  centerOfMassLessons,
  centerOfMassQuestions,
} from '../content/olimpiadas/centro-de-massa'
import {
  handbookPages,
  resolveSource,
} from '../content/olimpiadas/centro-de-massa/reader'
import { coursesForTrack, questionsForTrack } from '../content/catalog'
import { worksheetsForTrack, worksheetPath } from '../content/worksheets'
import { handbookForLesson } from '../content/handbooks'
import { routeFromLocation } from '../src/app/navigation'
import type { SourceSlice } from '../src/app/handbook'

const root = new URL('../', import.meta.url)
const coverage = JSON.parse(
  readFileSync(
    new URL('content/olimpiadas/centro-de-massa/coverage.json', root),
    'utf8',
  ),
)
const structural = JSON.parse(
  readFileSync(
    new URL(
      'content/olimpiadas/centro-de-massa/structural-headings.json',
      root,
    ),
    'utf8',
  ),
) as SourceSlice[]
const text = (refs: SourceSlice[]) =>
  resolveSource(refs)
    .map((b) => b.text)
    .join(' ')
const refsFor = (id: string) =>
  centerOfMassLessons.find((l) => l.id === 'olymp-cm-' + id)!.refs

test('center-of-mass lessons, questions and hints cover all 52 instructional pages and 1450 original blocks', () => {
  assert.equal(coverage.pages.length, 52)
  assert.equal(
    coverage.pages.reduce(
      (sum: number, p: { sourceBlocks: number }) => sum + p.sourceBlocks,
      0,
    ),
    1450,
  )
  for (const source of coverage.sources) {
    assert.equal(
      createHash('sha256')
        .update(
          readFileSync(new URL(`materiais/referencias/${source.file}`, root)),
        )
        .digest('hex'),
      source.sha256,
    )
  }
  const used = new Set<string>()
  const theoryOccurrences = new Map<string, number>()
  const collect = (refs: SourceSlice[], lesson = false) =>
    refs.forEach((ref) => {
      const blocks = handbookPages[ref.page]!
      assert.ok(blocks, ref.page)
      for (let i = ref.start ?? 0; i < (ref.end ?? blocks.length); i++) {
        const key = `${ref.page}:${i}`
        used.add(key)
        if (lesson && ref.page.startsWith('aula-'))
          theoryOccurrences.set(key, (theoryOccurrences.get(key) ?? 0) + 1)
      }
    })
  centerOfMassLessons.forEach((l) => collect(l.refs, true))
  centerOfMassQuestions.forEach((q) => {
    collect(q.statement)
    collect(q.solution)
    collect(q.hints ?? [])
  })
  collect(structural)
  for (const page of coverage.pages) {
    assert.equal(page.sourceBlocks, page.coveredBlocks)
    const key = `${page.document}-${page.page}`
    const blocks = handbookPages[key]!
    assert.equal(
      new Set(blocks.flatMap((b) => b.source.blocks)).size,
      page.sourceBlocks,
      key,
    )
    blocks.forEach((_, i) => {
      assert.ok(used.has(`${key}:${i}`), `Missing ${key}:${i}`)
      if (page.document === 'aula')
        assert.equal(
          theoryOccurrences.get(`${key}:${i}`),
          1,
          `Duplicate or missing theory ${key}:${i}`,
        )
    })
  }
})

test('all center-of-mass equations and thirteen diagrams resolve to isolated vector symbols', () => {
  const files = new Map<string, string>()
  let figures = 0
  for (const blocks of Object.values(handbookPages))
    for (const block of blocks) {
      if (block.type === 'figure') figures++
      for (const image of [
        block.image,
        ...(block.runs ?? []).map((r) => r.math),
      ].filter(Boolean)) {
        assert.ok(image!.width > 0 && image!.height > 0)
        const [file, id] = image!.src.split('#')
        assert.ok(file!.startsWith('/centro-de-massa/'))
        if (!files.has(file!))
          files.set(file!, readFileSync(new URL(`public${file}`, root), 'utf8'))
        const svg = files.get(file!)!
        assert.ok(id && svg.includes(`id="${id}"`), image!.src)
        assert.ok(!/<script|foreignObject|<image|\.pdf/i.test(svg))
      }
    }
  assert.equal(figures, 13)
  assert.equal(files.size, 52)
})

test('lessons have 1–2 source pages or at most four for advanced deductions and never cut a continuing section', () => {
  assert.equal(centerOfMassLessons.length, 18)
  assert.equal(centerOfMassCourse.units.length, 7)
  for (const lesson of centerOfMassLessons) {
    assert.equal(
      lesson.pages,
      new Set(lesson.refs.map((r) => r.page)).size,
      lesson.id,
    )
    assert.ok(lesson.pages! >= 1 && lesson.pages! <= 4, lesson.id)
    if (
      !['rigidos', 'pendulo', 'sintese', 'formulario-vinculos'].some(
        (slug) => lesson.id === 'olymp-cm-' + slug,
      )
    )
      assert.ok(lesson.pages! <= 2, lesson.id)
    assert.equal(handbookForLesson(lesson.id)?.course.id, centerOfMassCourse.id)
  }
  assert.ok(text(refsFor('rigidos')).includes('5.5 Exemplo resolvido 6'))
  assert.ok(text(refsFor('pendulo')).includes('9.4 Tensão'))
  assert.deepEqual(
    refsFor('pendulo').map((r) => r.page),
    ['aula-22', 'aula-23', 'aula-24'],
  )
  assert.ok(text(refsFor('dois-corpos')).includes('6.4 Exemplo resolvido 8'))
  assert.ok(text(refsFor('sintese')).includes('C - Pista.'))
  assert.ok(text(refsFor('formulario-vinculos')).includes('13.8 Referenciais'))
  assert.ok(text(refsFor('formulario-vinculos')).includes('Condição: r′'))
  assert.ok(!text(refsFor('formulario-rotacao')).includes('13.8 Referenciais'))
})

test('all 14 full problems retain their subparts, own optional hint and complete solutions', () => {
  assert.deepEqual(
    ['easy', 'medium', 'hard'].map(
      (d) => centerOfMassQuestions.filter((q) => q.difficulty === d).length,
    ),
    [8, 4, 2],
  )
  const partCounts = [3, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 5, 6]
  const endings = [
    'as massas são diferentes.',
    'pertencer ao material.',
    'concentrada em x = L.',
    'não alteram Px.',
    'cada trajetória individual.',
    'conservação da energia cinética.',
    'outras formas de energia.',
    'a translação do CM.',
    'YC diminui.',
    'e não −g.',
    'movimento relativo que para.',
    'por causa da rotação.',
    'sua normal unilateral.',
    'parte da solução.',
  ]
  for (const q of centerOfMassQuestions) {
    assert.ok(centerOfMassLessons.some((l) => l.id === q.lessonId))
    for (const part of 'abcdef'.slice(0, partCounts[q.sourceNumber - 1]))
      assert.ok(
        text(q.statement).includes(`(${part})`),
        `${q.id} missing (${part})`,
      )
    assert.ok(
      text(q.hints!).startsWith(`${q.sourceNumber}. `),
      `${q.id} wrong hint`,
    )
    assert.ok(
      text(q.solution).endsWith(endings[q.sourceNumber - 1]!),
      `${q.id} truncated solution`,
    )
  }
  for (const [number, pages] of [
    [13, ['ficha-14', 'ficha-15']],
    [14, ['ficha-16', 'ficha-17']],
  ] as const) {
    const q = centerOfMassQuestions.find((q) => q.sourceNumber === number)!
    assert.deepEqual([...new Set(q.solution.map((r) => r.page))], pages)
  }
  assert.ok(text(centerOfMassQuestions[12]!.solution).includes('H′(c)'))
  assert.ok(text(centerOfMassQuestions[13]!.solution).includes('u = uc'))
})

test('center of mass is a compact olympiad topic with its own sheet and does not leak into other tracks', () => {
  assert.equal(centerOfMassCourse.compact, true)
  assert.equal(coursesForTrack('olimpiadas').filter((c) => c.compact).length, 1)
  assert.equal(
    questionsForTrack('olimpiadas').filter(
      (q) => q.course === centerOfMassCourse.id,
    ).length,
    14,
  )
  const sheet = worksheetsForTrack('olimpiadas').find(
    (s) => s.id === centerOfMassCourse.id,
  )!
  assert.equal(sheet.title, 'Ficha de Centro de Massa')
  assert.equal(sheet.guideLessonId, 'olymp-cm-treino')
  const path = worksheetPath(centerOfMassCourse.id, 'olimpiadas')!
  assert.equal(path, '/trilhas/olimpiadas/questoes/centro-de-massa')
  assert.equal(routeFromLocation(path)?.sheetId, centerOfMassCourse.id)
  assert.equal(routeFromLocation(path + '/')?.sheetId, centerOfMassCourse.id)
  for (const track of ['ensino-medio', 'universidade'] as const) {
    assert.ok(
      !coursesForTrack(track).some((c) => c.id === centerOfMassCourse.id),
    )
    assert.deepEqual(questionsForTrack(track), [])
    assert.equal(worksheetPath(centerOfMassCourse.id, track), null)
    assert.equal(
      routeFromLocation(`/trilhas/${track}/questoes/centro-de-massa`)?.sheetId,
      'unavailable',
    )
  }
})
