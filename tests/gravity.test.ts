import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  gravityCourse,
  gravityLessons,
  gravityQuestions,
} from '../content/olimpiadas/gravitacao'
import {
  handbookPages,
  resolveSource,
} from '../content/olimpiadas/gravitacao/reader'
import {
  worksheets,
  worksheetsForTrack,
  worksheetPath,
} from '../content/worksheets'
import { routeFromLocation } from '../src/app/navigation'
import { coursesForTrack, questionsForTrack } from '../content/catalog'
import { handbookForLesson } from '../content/handbooks'
import type { SourceSlice } from '../src/app/handbook'

const root = new URL('../', import.meta.url)
const coverage = JSON.parse(
  readFileSync(
    new URL('content/olimpiadas/gravitacao/coverage.json', root),
    'utf8',
  ),
)
const structural = JSON.parse(
  readFileSync(
    new URL('content/olimpiadas/gravitacao/structural-headings.json', root),
    'utf8',
  ),
) as SourceSlice[]
const text = (refs: SourceSlice[]) =>
  resolveSource(refs)
    .map((b) => b.text)
    .join(' ')

test('gravitation preserves every instructional page and original block with verifiable source hashes', () => {
  assert.equal(coverage.pages.length, 60)
  for (const source of coverage.sources) {
    const pdf = readFileSync(
      new URL(`materiais/referencias/${source.file}`, root),
    )
    assert.equal(createHash('sha256').update(pdf).digest('hex'), source.sha256)
  }
  const mapped = new Set<string>()
  const collect = (refs: SourceSlice[]) =>
    refs.forEach((ref) => {
      const blocks = handbookPages[ref.page]
      assert.ok(blocks, ref.page)
      for (let i = ref.start ?? 0; i < (ref.end ?? blocks.length); i++)
        mapped.add(`${ref.page}:${i}`)
    })
  gravityLessons.forEach((lesson) => collect(lesson.refs))
  gravityQuestions.forEach((q) => {
    collect(q.statement)
    collect(q.solution)
  })
  collect(structural)
  for (const page of coverage.pages) {
    assert.equal(page.coveredBlocks, page.sourceBlocks)
    const blocks = handbookPages[`${page.document}-${page.page}`]!
    assert.equal(
      new Set(blocks.flatMap((b) => b.source.blocks)).size,
      page.sourceBlocks,
    )
    blocks.forEach((_, i) =>
      assert.ok(
        mapped.has(`${page.document}-${page.page}:${i}`),
        `Unmapped ${page.document}-${page.page}:${i}`,
      ),
    )
  }
})

test('gravitation equations and all nine diagrams resolve to isolated SVG symbols', () => {
  const files = new Map<string, string>()
  let figures = 0,
    equations = 0
  for (const blocks of Object.values(handbookPages))
    for (const b of blocks) {
      if (b.type === 'figure') figures++
      if (b.type === 'equation') equations++
      for (const image of [
        b.image,
        ...(b.runs ?? []).map((r) => r.math),
      ].filter(Boolean)) {
        const [file, fragment] = image!.src.split('#')
        assert.ok(file!.startsWith('/gravitacao/'))
        assert.ok(image!.width > 0 && image!.height > 0)
        if (!files.has(file!)) {
          const path = new URL(`public${file}`, root)
          assert.ok(existsSync(path), file)
          files.set(file!, readFileSync(path, 'utf8'))
        }
        assert.ok(
          fragment && files.get(file!)!.includes(`id="${fragment}"`),
          image!.src,
        )
        assert.ok(
          !/<script|foreignObject|<image|\.pdf/i.test(files.get(file!)!),
        )
      }
    }
  assert.equal(figures, 9)
  assert.ok(equations > 200)
  assert.equal(files.size, 60)
})

test('all 20 gravity problems retain subparts, final solution steps and the two-page precession solution', () => {
  assert.equal(gravityQuestions.length, 20)
  assert.deepEqual(
    ['easy', 'medium', 'hard'].map(
      (d) => gravityQuestions.filter((q) => q.difficulty === d).length,
    ),
    [12, 5, 3],
  )
  const endings = [
    'tornar-se positivo.',
    'nesse ponto.',
    'movimento radial de saída.',
    'a corda é mais curta.',
    'transferir entre os círculos.',
    'parábola não radial comum.',
    '16, não quatro.',
    'da massa maior.',
    'modelo pontual newtoniano.',
    'movimento radial.',
    'igualdade de a não basta.',
    'no campo.',
    'apenas adia o contato.',
    'demonstrando a diferença.',
    'diferentes de impulsos.',
    null,
    'sua dinâmica interna.',
    'apenas pela semelhança.',
    'essa família interna.',
    null,
  ]
  for (const q of gravityQuestions) {
    assert.ok(
      gravityLessons.some((l) => l.id === q.lessonId),
      q.id,
    )
    const parts =
      q.sourceNumber >= 18 && q.sourceNumber <= 19
        ? ['(a)', '(b)', '(c)', '(d)', '(e)', '(f)']
        : q.sourceNumber === 17 || q.sourceNumber === 20
          ? ['(a)', '(b)', '(c)', '(d)', '(e)']
          : ['(a)', '(b)', '(c)']
    for (const part of parts)
      assert.ok(text(q.statement).includes(part), `${q.id} missing ${part}`)
    const ending = endings[q.sourceNumber - 1]
    if (ending)
      assert.ok(
        text(q.solution).endsWith(ending),
        `${q.id}: truncated solution`,
      )
  }
  const precession = gravityQuestions.find((q) => q.sourceNumber === 18)!
  assert.deepEqual(
    [...new Set(precession.solution.map((r) => r.page))],
    ['ficha-24', 'ficha-25'],
  )
  assert.ok(text(precession.solution).includes('(f) Conservações e energia'))
  assert.ok(text(gravityQuestions[15]!.solution).includes('∆ε⊙'))
  assert.ok(
    text(gravityQuestions[19]!.solution).includes(
      'não é a escolha de menor impulso neste problema.',
    ),
  )
  // The PDF splits these inline roots into several blocks; keep them in one paragraph.
  assert.ok(
    resolveSource(gravityQuestions[6]!.solution).some(
      (b) =>
        b.text.startsWith('O período é') && b.text.endsWith('16, não quatro.'),
    ),
  )
  assert.equal(
    resolveSource(gravityQuestions[6]!.solution).filter((b) =>
      b.text.includes('16, não quatro.'),
    ).length,
    1,
  )
  assert.ok(
    resolveSource(gravityQuestions[19]!.solution).some(
      (b) =>
        b.text.startsWith('(c) Defina') && b.text.includes('zero. O custo'),
    ),
  )
})

test('gravity lessons keep deductions continuous and both courses remain isolated from other tracks', () => {
  assert.equal(gravityLessons.length, 38)
  assert.equal(gravityCourse.units.length, 14)
  for (const [slug, pages] of [
    ['lancamento', ['aula-11', 'aula-12']],
    ['binet', ['aula-13', 'aula-14']],
    ['queda', ['aula-20', 'aula-21']],
    ['hohmann', ['aula-22', 'aula-23']],
    ['mares', ['aula-26', 'aula-27']],
  ] as const) {
    const lesson = gravityLessons.find((l) => l.id === `olymp-gravity-${slug}`)!
    for (const page of pages)
      assert.ok(
        lesson.refs.some((r) => r.page === page),
        slug,
      )
    assert.equal(handbookForLesson(lesson.id)?.course.id, gravityCourse.id)
  }
  assert.equal(
    gravityLessons.filter((l) => l.id.includes('-formulario-')).length,
    6,
  )
  assert.equal(coursesForTrack('olimpiadas').length, 2)
  assert.equal(questionsForTrack('olimpiadas').length, 40)
  for (const id of ['ensino-medio', 'universidade'] as const) {
    assert.deepEqual(questionsForTrack(id), [])
    assert.equal(
      coursesForTrack(id).flatMap((c) => c.units.flatMap((u) => u.lessons))
        .length,
      0,
    )
    assert.deepEqual(worksheetsForTrack(id), [])
  }
})

test('named worksheets have independent reloadable URLs and cannot be opened through another track', () => {
  assert.equal(worksheetsForTrack('olimpiadas').length, 2)
  for (const sheet of worksheets) {
    const path = worksheetPath(sheet.id, 'olimpiadas')!
    assert.deepEqual(routeFromLocation(path), {
      screen: 'sheets',
      trackId: 'olimpiadas',
      sheetId: sheet.id,
    })
    assert.deepEqual(routeFromLocation(path + '/'), routeFromLocation(path))
    assert.ok(handbookForLesson(sheet.guideLessonId))
    assert.ok(handbookForLesson(sheet.answersLessonId))
    assert.equal(worksheetPath(sheet.id, 'universidade'), null)
    assert.equal(
      routeFromLocation(`/trilhas/universidade/questoes/${sheet.slug}`)
        ?.sheetId,
      'unavailable',
    )
  }
  assert.equal(routeFromLocation('/trilhas/olimpiadas/questoes')?.sheetId, null)
  assert.equal(
    routeFromLocation('/trilhas/olimpiadas/questoes/inexistente')?.sheetId,
    'unavailable',
  )
})
