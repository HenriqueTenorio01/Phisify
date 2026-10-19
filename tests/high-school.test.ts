import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  coursesForTrack,
  questionsForTrack,
  progressForTrack,
} from '../content/catalog'
import { lessonById } from '../content/courses'
import { searchContent } from '../src/search'
import { handbooks, handbookForLesson } from '../content/handbooks'
import { worksheetsForTrack, worksheetPath } from '../content/worksheets'
import { loadHandbook } from '../src/components/handbook/loadHandbook'
import { routeFromLocation } from '../src/app/navigation'
import { emptyProgress } from '../src/app/storage'
import { completeLessonProgress } from '../src/app/lessonProgress'
import { lessonCompletion } from '../content/lesson-compatibility'
import { AppContext, type AppContextValue } from '../src/app/context'
import { CoursePage } from '../src/pages/CoursePage'
import { SheetsPage } from '../src/pages/SheetsPage'
import type { HandbookBlock, SourceSlice } from '../src/app/handbook'
import type { WrittenQuestion } from '../src/app/types'
const root = new URL('../', import.meta.url)
const collections = [
  ['electricity', 'eletricidade', 'hs-elec', 23, 76, 1383, 19, 30],
  ['waves', 'mhs-ondas', 'hs-mhs', 19, 79, 1755, 24, 36],
  ['optics', 'optica', 'hs-opt', 23, 75, 1397, 30, 30],
  ['thermo', 'termologia', 'hs-term', 19, 79, 1432, 18, 29],
] as const
const read = (folder: string, file: string) =>
  JSON.parse(
    readFileSync(
      new URL(`content/ensino-medio/${folder}/${file}.json`, root),
      'utf8',
    ),
  )
const materials = await Promise.all(
  collections.map(
    async ([
      id,
      folder,
      prefix,
      readings,
      pages,
      blocks,
      figures,
      examples,
    ]) => ({
      id,
      folder,
      prefix,
      expected: { readings, pages, blocks, figures, examples },
      reader: await loadHandbook(id),
      book: handbooks.find((b) => b.course.id === id)!,
      coverage: read(folder, 'coverage'),
      structural: read(folder, 'structural-headings') as SourceSlice[],
      questions: questionsForTrack('ensino-medio').filter(
        (q) => q.course === id,
      ) as WrittenQuestion[],
    }),
  ),
)

test('the eight new PDFs retain all 309 instructional pages and 5967 original source blocks without duplicate readings', () => {
  for (const {
    folder,
    reader,
    book,
    coverage,
    structural,
    questions,
    expected,
  } of materials) {
    assert.equal(coverage.pages.length, expected.pages)
    assert.equal(
      coverage.pages.reduce(
        (sum: number, p: { sourceBlocks: number }) => sum + p.sourceBlocks,
        0,
      ),
      expected.blocks,
    )
    for (const source of coverage.sources)
      assert.equal(
        createHash('sha256')
          .update(
            readFileSync(
              new URL(
                `materiais/referencias/ensino-medio/${source.file}`,
                root,
              ),
            ),
          )
          .digest('hex'),
        source.sha256,
      )
    const occurrences = new Map<string, number>()
    const collect = (refs: SourceSlice[]) =>
      refs.forEach((ref) => {
        const blocks = reader.handbookPages[ref.page]!
        assert.ok(blocks, `${folder}:${ref.page}`)
        for (let i = ref.start ?? 0; i < (ref.end ?? blocks.length); i++) {
          const key = `${ref.page}:${i}`
          occurrences.set(key, (occurrences.get(key) ?? 0) + 1)
        }
      })
    book.lessons.forEach((l) => collect(l.refs))
    questions.forEach((q) => {
      collect(q.statement)
      collect(q.solution)
      collect(q.hints ?? [])
    })
    collect(structural)
    for (const page of coverage.pages) {
      const key = `${page.document}-${page.page}`,
        blocks = reader.handbookPages[key]!
      assert.equal(page.coveredBlocks, page.sourceBlocks)
      assert.equal(
        new Set(blocks.flatMap((b) => b.source.blocks)).size,
        page.sourceBlocks,
        `${folder}:${key}`,
      )
      blocks.forEach((_, i) =>
        assert.equal(
          occurrences.get(`${key}:${i}`),
          1,
          `${folder}:${key}:${i}`,
        ),
      )
    }
  }
})

test('91 reviewed diagrams, 125 worked examples, six native tables and every vector expression are retained', () => {
  const files = new Map<string, string>()
  let examples = 0,
    figures = 0,
    tables = 0
  for (const { reader, coverage, expected, folder } of materials) {
    let localFigures = 0,
      localExamples = 0
    const localFiles = new Set<string>()
    for (const block of Object.values(reader.handbookPages).flat()) {
      if (block.type === 'figure') localFigures++
      if (
        block.type === 'heading' &&
        block.text.startsWith('Exemplo resolvido')
      )
        localExamples++
      if (block.type === 'table') {
        tables++
        assert.ok(block.columns?.length && block.cells?.length)
        assert.ok(
          block.cells!.every(
            (row) =>
              row.length === block.columns!.length &&
              row.every((cell) => cell.length),
          ),
        )
      }
      const vectors = [
        block.image,
        ...(block.runs ?? []).map((r) => r.math),
        ...(block.cells ?? []).flat(2).map((r) => r.math),
      ].filter(Boolean)
      for (const image of vectors) {
        const [file, id] = image!.src.split('#')
        localFiles.add(file!)
        if (!files.has(file!))
          files.set(file!, readFileSync(new URL('public' + file, root), 'utf8'))
        assert.ok(
          file!.startsWith('/em-' + folder + '/') &&
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
      assert.ok(
        !(block.type === 'equation' && block.text === '√'),
        'Detached inline radical',
      )
    }
    assert.equal(localFiles.size, coverage.spriteFiles)
    assert.equal(localFigures, expected.figures)
    assert.equal(localExamples, expected.examples)
    examples += localExamples
    figures += localFigures
  }
  assert.equal(figures, 91)
  assert.equal(examples, 125)
  assert.equal(tables, 6)
})

test('84 balanced readings preserve whole original chapters and keep source sections and consultation material in sequence', () => {
  for (const { book, reader, expected, coverage } of materials) {
    assert.equal(book.lessons.length, expected.readings)
    let chapter = 0,
      lastPage = 5
    for (const lesson of book.lessons) {
      assert.ok(lesson.pages! >= 1 && lesson.pages! <= 4, lesson.id)
      assert.equal(new Set(lesson.refs.map((r) => r.page)).size, lesson.pages)
      assert.equal(lessonById(lesson.id)?.course.id, book.course.id)
      assert.equal(handbookForLesson(lesson.id)?.course.id, book.course.id)
      if (lesson.chapter) {
        assert.equal(lesson.chapter, ++chapter)
        assert.equal(Number(lesson.refs[0]!.page.split('-')[1]), lastPage + 1)
        lastPage = Number(lesson.refs.at(-1)!.page.split('-')[1])
        assert.ok(
          reader
            .resolveSource(lesson.refs)
            .some((b) => b.type === 'heading' && b.text === lesson.title),
          lesson.id,
        )
      }
    }
    assert.equal(
      chapter,
      { electricity: 18, waves: 11, optics: 18, thermo: 14 }[
        book.course.id as 'electricity'
      ],
    )
    assert.equal(
      coverage.sources[0].pages,
      lastPage + (book.course.id === 'waves' ? 7 : 1),
    )
  }
  const waves = materials.find((m) => m.id === 'waves')!
  const oscillator = waves.book.lessons.find((l) => l.id === 'hs-mhs-c03')!
  assert.deepEqual(
    oscillator.refs.map((r) => r.page),
    ['aula-11', 'aula-12', 'aula-13', 'aula-14'],
  )
  assert.equal(
    waves.book.lessons
      .filter((l) => l.id.includes('formulario'))
      .reduce((sum, l) => sum + l.pages!, 0),
    6,
  )
})

test('all 120 statements and solutions stay with their own source number, subparts, subject and original difficulty', () => {
  for (const { questions, reader, book, prefix } of materials) {
    assert.equal(questions.length, 30)
    assert.deepEqual(
      ['easy', 'medium', 'hard'].map(
        (d) => questions.filter((q) => q.difficulty === d).length,
      ),
      [18, 8, 4],
    )
    assert.deepEqual(
      questions.map((q) => q.sourceNumber),
      Array.from({ length: 30 }, (_, i) => i + 1),
    )
    for (const q of questions) {
      assert.equal(
        q.id,
        `${prefix}-q${String(q.sourceNumber).padStart(2, '0')}`,
      )
      const statement = reader.resolveSource(q.statement),
        solution = reader.resolveSource(q.solution)
      assert.equal(
        statement.filter((b) => /^Questão \d+/.test(b.text)).length,
        1,
      )
      assert.equal(
        solution.filter((b) => /^Questão \d+/.test(b.text)).length,
        1,
      )
      assert.ok(statement[0]!.text.startsWith(`Questão ${q.sourceNumber} - `))
      assert.ok(solution[0]!.text.startsWith(`Questão ${q.sourceNumber} - `))
      for (const part of ['(a)', '(b)', '(c)'])
        assert.ok(
          statement.some((b) => b.text.includes(part)),
          q.id + ' ' + part,
        )
      for (const part of ['(a)', '(b)', '(c)'])
        assert.ok(
          solution.some((b) => b.text.includes(part)),
          q.id + ' solution ' + part,
        )
      const l = book.lessons.find((l) => l.id === q.lessonId)!
      assert.ok(l, q.id)
      assert.equal(l.topicId, q.topicId)
      for (const id of q.relatedLessonIds ?? [])
        assert.ok(
          book.lessons.some((l) => l.id === id),
          q.id,
        )
      if (q.hints?.length)
        assert.ok(
          reader
            .resolveSource(q.hints)
            .every((b) => b.text.startsWith('Roteiro')),
          q.id,
        )
    }
  }
  // Concrete subject checks prevent linking advanced problems to unrelated chapters.
  const find = (id: string) =>
    materials.flatMap((m) => m.questions).find((q) => q.id === id)!
  for (const [id, lesson] of [
    ['hs-elec-q27', 'hs-elec-c11'],
    ['hs-elec-q28', 'hs-elec-c09'],
    ['hs-mhs-q25', 'hs-mhs-c10'],
    ['hs-opt-q23', 'hs-opt-c13'],
    ['hs-opt-q25', 'hs-opt-c17'],
    ['hs-term-q22', 'hs-term-c04'],
    ['hs-term-q25', 'hs-term-c12'],
  ])
    assert.equal(find(id!).lessonId, lesson)
})

test('all five school areas and worksheets use reloadable thematic routes with independent progress and no retired IDs', () => {
  assert.deepEqual(
    coursesForTrack('ensino-medio').map((c) => c.id),
    ['mechanics', 'electricity', 'waves', 'optics', 'thermo'],
  )
  assert.equal(questionsForTrack('ensino-medio').length, 210)
  assert.equal(worksheetsForTrack('ensino-medio').length, 5)
  for (const { id, book, questions } of materials) {
    const sheet = worksheetsForTrack('ensino-medio').find((s) => s.id === id)!
    assert.ok(book.lessons.some((l) => l.id === sheet.guideLessonId))
    assert.ok(book.lessons.some((l) => l.id === sheet.answersLessonId))
    for (const topic of sheet.topics!) {
      assert.ok(
        questions.some((q) => q.topicId === topic.id),
        id + ':' + topic.id,
      )
      assert.equal(
        routeFromLocation(
          `/trilhas/ensino-medio/cursos/${id}`,
          '?tema=' + topic.id,
        )?.topicId,
        topic.id,
      )
      const route = routeFromLocation(
        worksheetPath(id, 'ensino-medio')!,
        '?tema=' + topic.id,
      )!
      assert.equal(route.sheetId, id)
      assert.equal(route.topicId, topic.id)
    }
    const old = {
      ...emptyProgress(),
      completedLessons: [
        'hs-mech-mruv',
        'olymp-cm-geometria',
        'lesson-free-fall',
      ],
      responses: { [questions[0]!.id]: { selected: 1, correct: true, at: 1 } },
    }
    const after = completeLessonProgress(old, book.lessons[0]!.id, 'Study', 2)
    assert.deepEqual(after.responses, old.responses)
    assert.ok(after.completedLessons.includes('lesson-free-fall'))
    assert.ok(
      progressForTrack(after, 'ensino-medio').completedLessons.includes(
        book.lessons[0]!.id,
      ),
    )
    assert.ok(
      !progressForTrack(after, 'olimpiadas').completedLessons.includes(
        book.lessons[0]!.id,
      ),
    )
    assert.ok(
      !progressForTrack(after, 'universidade').responses[questions[0]!.id],
    )
    assert.equal(
      completeLessonProgress(after, book.lessons[0]!.id, 'Again', 3),
      after,
    )
  }
  assert.ok(searchContent('Kirchhoff', 'ensino-medio').lessons.length)
  assert.ok(
    !questionsForTrack('olimpiadas').some((q) => q.id.startsWith('hs-')),
  )
  assert.ok(
    !questionsForTrack('ensino-medio').some((q) => q.id === 'q-free-fall'),
  )
})

test('the real course and sheet overviews show topics first, correct area labels and 30-question links', () => {
  for (const { id, book } of materials) {
    const raw = emptyProgress()
    const value: AppContextValue = {
      route: {
        trackId: 'ensino-medio',
        screen: 'course',
        courseId: id,
        lessonId: '',
        labId: 'waves',
        sheetId: id,
      },
      progress: raw,
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
    const show = (component: typeof CoursePage | typeof SheetsPage) =>
      renderToStaticMarkup(
        createElement(AppContext.Provider, { value }, createElement(component)),
      )
    const overview = show(CoursePage)
    assert.equal(
      (overview.match(/sheet-catalog-card/g) ?? []).length,
      book.course.units.length,
    )
    assert.ok(overview.includes('Todos os temas de ' + book.course.area))
    assert.ok(!overview.includes('class="lesson-row"'))
    assert.ok(!overview.includes('Mecânica'))
    const sheet = show(SheetsPage)
    assert.ok(sheet.includes('Ver as 30 questões'))
    assert.ok(!sheet.includes('Ver as 90 questões'))
    assert.ok(!sheet.includes('handbook-question'))
    value.route.topicId = book.course.units[0]!.id
    assert.equal(
      (show(CoursePage).match(/class="lesson-row"/g) ?? []).length,
      book.course.units[0]!.lessons.length,
    )
  }
})

// These curves were lost by intersecting-path redaction during the first export.
test('diagram export preserves both dipole curves and the dashed virtual rays', () => {
  const symbol = (folder: string, page: number) => {
    const { reader } = materials.find((item) => item.folder === folder)!
    const image = reader.handbookPages[`aula-${page}`]!.find(
      (block) => block.type === 'figure',
    )!.image!
    const [file, id] = image.src.split('#')
    const svg = readFileSync(new URL('public' + file, root), 'utf8')
    return svg.split(`<symbol id="${id}"`)[1]!.split('</symbol>')[0]!
  }
  const dipolePaths = symbol('eletricidade', 8).match(/<path [^>]+>/g)!
  assert.equal(
    dipolePaths.filter(
      (path) => path.includes('stroke="#007e87"') && /d="[^"]*C/.test(path),
    ).length,
    2,
  )
  assert.equal(
    (symbol('optica', 10).match(/stroke-dasharray=/g) ?? []).length,
    2,
  )
})
