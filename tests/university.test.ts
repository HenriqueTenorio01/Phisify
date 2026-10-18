import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  universityCourse,
  universityLessons,
  universityAulas,
} from '../content/universidade/semestre-1'
import { loadUniversityReader } from '../content/universidade/semestre-1/reader'
import { loadHandbook } from '../src/components/handbook/loadHandbook'
import { courseById, lessonById } from '../content/courses'
import { coursesForTrack, progressForTrack } from '../content/catalog'
import { handbookForLesson } from '../content/handbooks'
import { worksheetPath } from '../content/worksheets'
import { routeFromLocation } from '../src/app/navigation'
import { emptyProgress } from '../src/app/storage'
import { completeLessonProgress } from '../src/app/lessonProgress'
import { lessonCompletion } from '../content/lesson-compatibility'
import { AppContext, type AppContextValue } from '../src/app/context'
import { CoursePage } from '../src/pages/CoursePage'
import type { HandbookBlock, SourceSlice } from '../src/app/handbook'
const root = new URL('../', import.meta.url)
const coverage = JSON.parse(
  readFileSync(
    new URL('content/universidade/semestre-1/coverage.json', root),
    'utf8',
  ),
)
const readers = await Promise.all(
  universityAulas.map((aula) => loadUniversityReader(aula.number)),
)
const pages: Record<string, HandbookBlock[]> = Object.assign(
  {},
  ...readers.map((reader) => reader.handbookPages),
)
const expand = (refs: SourceSlice[]) =>
  refs.flatMap((ref) =>
    pages[ref.page]!.slice(ref.start ?? 0, ref.end).map(
      (_, i) => `${ref.page}:${(ref.start ?? 0) + i}`,
    ),
  )

test('university handbooks retain all 234 instructional pages and 4533 source blocks exactly once', () => {
  assert.equal(coverage.pages.length, 234)
  assert.equal(
    coverage.pages.reduce(
      (n: number, p: { sourceBlocks: number }) => n + p.sourceBlocks,
      0,
    ),
    4533,
  )
  assert.equal(
    coverage.sources.reduce(
      (n: number, s: { pages: number }) => n + s.pages,
      0,
    ),
    249,
  )
  for (const source of coverage.sources)
    assert.equal(
      createHash('sha256')
        .update(
          readFileSync(
            new URL(
              'materiais/referencias/universitario/semestre-1/' + source.file,
              root,
            ),
          ),
        )
        .digest('hex'),
      source.sha256,
    )
  const used = universityLessons.flatMap((l) => expand(l.refs))
  assert.equal(used.length, new Set(used).size, 'No duplicated reading content')
  const set = new Set(used)
  for (const page of coverage.pages) {
    const key = `aula${page.document}-${page.page}`,
      blocks = pages[key]!
    assert.equal(page.sourceBlocks, page.coveredBlocks)
    assert.equal(
      new Set(blocks.flatMap((b) => b.source.blocks)).size,
      page.sourceBlocks,
      key,
    )
    blocks.forEach((_, i) =>
      assert.ok(set.has(`${key}:${i}`), `Missing ${key}:${i}`),
    )
  }
})

test('all 92 original figures, 64 examples, five notation tables and isolated equation symbols are preserved', () => {
  const files = new Map<string, string>()
  let figures = 0,
    examples = 0,
    tables = 0
  for (const blocks of Object.values(pages))
    for (const block of blocks) {
      if (block.type === 'figure') {
        figures++
        assert.match(block.text, /^Figura \d+\.\d+:/)
      }
      if (block.type === 'heading' && block.text.startsWith('EXEMPLO'))
        examples++
      if (block.type === 'table') {
        tables++
        assert.ok(block.rows!.length >= 13)
        assert.ok(
          block.rows!.every((row) => row.symbol.length && row.meaning.length),
        )
      }
      const vectors = [
        block.image,
        ...(block.runs ?? []).map((r) => r.math),
        ...(block.rows ?? []).flatMap((row) =>
          [...row.symbol, ...row.meaning].map((r) => r.math),
        ),
      ].filter(Boolean)
      for (const image of vectors) {
        const [file, id] = image!.src.split('#')
        if (!files.has(file!))
          files.set(file!, readFileSync(new URL('public' + file, root), 'utf8'))
        assert.ok(
          file!.startsWith('/universidade-s1/') &&
            id &&
            files.get(file!)!.includes(`id="${id}"`),
          image!.src,
        )
        assert.ok(image!.width > 0 && image!.height > 0)
        assert.ok(
          !/<script|foreignObject|<image|\.pdf|&#x00(?:0[0-8bcef]|1[0-9a-f]);/i.test(
            files.get(file!)!,
          ),
        )
      }
    }
  assert.equal(figures, 92)
  assert.equal(examples, 64)
  assert.equal(tables, 5)
  assert.equal(files.size, coverage.spriteFiles)
  for (const blocks of Object.values(pages))
    assert.ok(
      !blocks.some((b) => b.type === 'equation' && b.text === '√'),
      'Inline roots stay attached to their complete expression',
    )
  const normParagraph = pages['aula01-34']!.find(
    (b) => b.type === 'paragraph' && b.text.includes('Aqui r ='),
  )!
  assert.ok(normParagraph.text.includes('x2 + y2'))
  assert.ok(normParagraph.runs!.some((r) => r.math && r.text.includes('√')))
  for (const key of ['01', '02', '03', '05', '06'])
    assert.ok(
      pages[`aula${key}-2`]!.some((b) =>
        b.runs?.some((r) => r.text.includes('→')),
      ),
    )
})

test('the semester preserves the five source lesson numbers with balanced readings and continuous derivations', () => {
  assert.equal(universityCourse.semester, 1)
  assert.deepEqual(
    universityAulas.map((a) => a.number),
    [1, 2, 3, 5, 6],
  )
  assert.equal(universityLessons.length, 79)
  const ids = new Set(universityLessons.map((l) => l.id))
  assert.equal(ids.size, 79)
  for (const l of universityLessons) {
    assert.ok(l.pages >= 1 && l.pages <= 4, l.id)
    assert.equal(new Set(l.refs.map((r) => r.page)).size, l.pages)
    assert.ok(
      l.refs.every((r) =>
        r.page.startsWith(`aula${String(l.sourceLesson).padStart(2, '0')}-`),
      ),
    )
    assert.equal(lessonById(l.id)?.course.id, universityCourse.id)
    assert.equal(handbookForLesson(l.id)?.course.id, universityCourse.id)
  }
  const body = (id: string) =>
    expand(universityLessons.find((l) => l.id === id)!.refs)
      .map((ref) => {
        const [p, i] = ref.split(':')
        return pages[p!]![Number(i)]!.text
      })
      .join(' ')
  assert.ok(body('uni-s1-a01-c03a').includes('3.2 Rapidez'))
  assert.ok(!body('uni-s1-a01-c03a').includes('3.3 Aceleração'))
  assert.ok(body('uni-s1-a01-c03b').startsWith('3.3 Aceleração'))
  assert.ok(body('uni-s1-a01-c10b').startsWith('10.3 Quando'))
  for (const aula of universityAulas) {
    const list = universityLessons.filter((l) => l.sourceLesson === aula.number)
    assert.ok(list[0]!.id.endsWith('-orientacao'))
    assert.ok(list.at(-1)!.id.endsWith('-referencias'))
    assert.equal(list.length, aula.readings)
  }
})

test('readers load one source lesson at a time and theme/reading URLs preserve their context', async () => {
  for (let i = 0; i < universityAulas.length; i++) {
    const aula = universityAulas[i]!,
      reader = readers[i]!
    assert.ok(
      Object.keys(reader.handbookPages).every((key) =>
        key.startsWith(`aula${String(aula.number).padStart(2, '0')}-`),
      ),
    )
    const first = universityLessons.find((l) => l.sourceLesson === aula.number)!
    assert.ok(
      reader
        .sourceLabel(first.refs)
        .includes('Aula ' + String(aula.number).padStart(2, '0')),
    )
    assert.equal(
      routeFromLocation(
        '/trilhas/universidade/cursos/university-mechanics-1',
        '?tema=' + aula.id,
      )?.topicId,
      aula.id,
    )
    assert.equal(
      routeFromLocation('/trilhas/universidade/aulas/' + first.id)?.lessonId,
      first.id,
    )
    assert.equal(
      loadHandbook(universityCourse.id, aula.number),
      loadHandbook(universityCourse.id, aula.number),
    )
  }
  await assert.rejects(() => loadUniversityReader(4), /indisponível/)
  assert.equal(worksheetPath(universityCourse.id, 'universidade'), null)
})

test('university progress and discovery stay separate from Ensino Médio, Olimpíadas and retired IDs', () => {
  assert.equal(courseById(universityCourse.id)?.trackId, 'universidade')
  for (const track of ['ensino-medio', 'olimpiadas'] as const)
    assert.ok(!coursesForTrack(track).some((c) => c.id === universityCourse.id))
  const original = {
    ...emptyProgress(),
    completedLessons: [
      'hs-mech-mruv',
      'olymp-cm-geometria',
      'lesson-free-fall',
    ],
    responses: { 'hs-mech-q01': { selected: 1, correct: true, at: 1 } },
  }
  const after = completeLessonProgress(
    original,
    universityLessons[0]!.id,
    universityLessons[0]!.title,
    2,
  )
  assert.deepEqual(original.completedLessons, [
    'hs-mech-mruv',
    'olymp-cm-geometria',
    'lesson-free-fall',
  ])
  assert.deepEqual(after.responses, original.responses)
  assert.deepEqual(progressForTrack(after, 'universidade').completedLessons, [
    universityLessons[0]!.id,
  ])
  assert.deepEqual(progressForTrack(after, 'ensino-medio').completedLessons, [
    'hs-mech-mruv',
  ])
  assert.deepEqual(progressForTrack(after, 'olimpiadas').completedLessons, [
    'olymp-cm-geometria',
  ])
  assert.equal(
    completeLessonProgress(after, universityLessons[0]!.id, 'Repeated', 3),
    after,
  )
})

test('the real semester page presents source lessons first and only lists readings in the chosen lesson', () => {
  const raw = {
    ...emptyProgress(),
    completedLessons: [universityLessons[0]!.id],
  }
  const value: AppContextValue = {
    route: {
      trackId: 'universidade',
      screen: 'course',
      courseId: universityCourse.id,
      lessonId: '',
      labId: 'waves',
      sheetId: null,
    },
    progress: progressForTrack(raw, 'universidade'),
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
  const show = () =>
    renderToStaticMarkup(
      createElement(AppContext.Provider, { value }, createElement(CoursePage)),
    )
  const overview = show()
  assert.ok(overview.includes('1º semestre · Mecânica I'))
  assert.equal((overview.match(/sheet-catalog-card/g) ?? []).length, 5)
  assert.ok(!overview.includes('class="lesson-row"'))
  value.route.topicId = 'aula-01'
  const selected = show()
  assert.ok(selected.includes('Conteúdo da aula 1'))
  assert.equal(
    (selected.match(/class="lesson-row"/g) ?? []).length,
    universityAulas[0]!.readings,
  )
  assert.equal((selected.match(/lesson-state done/g) ?? []).length, 1)
  assert.ok(!selected.includes('Todos os temas de Mecânica'))
})
