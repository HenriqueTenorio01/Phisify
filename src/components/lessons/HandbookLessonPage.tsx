import {
  UniversityBreadcrumbs,
  UniversityLessonNavigation,
  UniversitySections,
} from '../university/UniversityLessonNavigation'
import { worksheetPath } from '../../../content/worksheets'
import { use, useState } from 'react'
import { handbookForLesson } from '../../../content/handbooks'
import { loadHandbook } from '../handbook/loadHandbook'
import { questionBank } from '../../../content/questions'
import { useApp } from '../../app/context'
import { useAuth } from '../../hooks/useAuth'
import { HandbookBlocks, blockAnchor } from '../handbook/HandbookBlocks'
import { QuestionCard } from '../questions/QuestionCard'

export default function HandbookLessonPage({ id }: { id: string }) {
  const {
    progress,
    openCourse,
    openLesson,
    completeLesson,
    answerQuestion,
    openSheet,
    lessonCompletion,
  } = useApp()
  const { user } = useAuth()
  const [outlineOpen, setOutlineOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1051px)').matches,
  )
  const book = handbookForLesson(id)
  if (!book) return null
  const { course, lessons } = book
  const university = course.trackId === 'universidade'
  const lesson = lessons.find((item) => item.id === id)!
  const { resolveSource, sourceLabel } = use(
    loadHandbook(course.id, lesson.sourceLesson),
  )
  const blocks = resolveSource(lesson.refs)
  // The source chapter title is already the reading's h1.
  const readingBlocks =
    university &&
    blocks[0]?.type === 'heading' &&
    blocks[0].text === lesson.title
      ? blocks.slice(1)
      : blocks
  const headings = blocks.filter(
    (block) => block.type === 'heading' && block.level !== 4,
  )
  const index = lessons.findIndex((item) => item.id === id)
  const previous = lessons[index - 1]
  const next = lessons[index + 1]
  const completed = progress.completedLessons.includes(id)
  const parts = lessonCompletion(id)
  const questions = questionBank.filter((question) => question.lessonId === id)
  const numberInCourse =
    course.units
      .flatMap((unit) => unit.lessons)
      .findIndex((item) => item.id === id) + 1
  return (
    <>
      {university && <UniversityBreadcrumbs course={course} lesson={lesson} />}
      <div
        className={
          university ? 'handbook-layout university-handbook' : 'handbook-layout'
        }
      >
        <aside className="handbook-nav">
          {university ? (
            <UniversityLessonNavigation
              course={course}
              lesson={lesson}
              lessons={lessons}
            />
          ) : (
            <>
              <button
                className="link-button"
                onClick={() => openCourse(course.id, lesson.topicId)}
              >
                ← Sumário do curso
              </button>
              <p className="handbook-nav-label">
                {course.level} · {course.area}
              </p>
              <p>
                {numberInCourse} de {lessons.length} aulas
              </p>
              <details
                open={outlineOpen}
                onToggle={(event) => setOutlineOpen(event.currentTarget.open)}
                className="handbook-course-outline"
              >
                <summary>Navegar pelos módulos</summary>
                {course.units.map((unit) => (
                  <div key={unit.title}>
                    <strong>{unit.title}</strong>
                    {unit.lessons.map((item) => (
                      <button
                        key={item.id}
                        className={item.id === id ? 'active' : ''}
                        aria-current={item.id === id ? 'page' : undefined}
                        onClick={() => openLesson(item.id)}
                      >
                        {progress.completedLessons.includes(item.id)
                          ? '✓ '
                          : ''}
                        {item.title}
                      </button>
                    ))}
                  </div>
                ))}
              </details>
            </>
          )}
        </aside>
        <div className="handbook-reading">
          <article className="handbook-paper">
            <header className="handbook-lesson-header">
              <div className="handbook-kicker">
                {university
                  ? `Universidade · ${course.semester}º semestre · ${course.title}`
                  : course.trackId === 'ensino-medio'
                    ? 'Mecânica · Ensino Médio'
                    : 'Caderno de treinamento · TBF / IPhO'}
              </div>
              <p className="handbook-unit">{lesson.unit}</p>
              <h1>{lesson.title}</h1>
              <p className="handbook-small">
                {lesson.pages && (
                  <>
                    {lesson.estimatedPages ? 'Cerca de ' : ''}
                    {lesson.pages} {lesson.pages === 1 ? 'página' : 'páginas'}{' '}
                    {lesson.estimatedPages
                      ? 'de leitura'
                      : 'do material de referência'}
                    {lesson.pages > 2 ? ' · estudo aprofundado' : ''} ·{' '}
                  </>
                )}
                Leitura com deduções completas · cerca de {lesson.minutes} min,
                além da resolução dos exercícios.
              </p>
              {parts.completed > 0 && parts.completed < parts.total && (
                <p className="handbook-small">
                  Você já concluiu {parts.completed} de {parts.total} trechos
                  desta aula.
                </p>
              )}
            </header>
            {university ? (
              <UniversitySections blocks={blocks} prefix={id} />
            ) : (
              headings.length > 1 && (
                <nav
                  className="handbook-local-outline"
                  aria-label="Seções desta aula"
                >
                  <strong>Nesta aula</strong>
                  {headings.map((block, i) => (
                    <a key={i} href={'#' + blockAnchor(block, id)}>
                      {block.text}
                    </a>
                  ))}
                </nav>
              )
            )}
            <HandbookBlocks
              blocks={readingBlocks}
              prefix={id}
              foldExamples={course.trackId === 'ensino-medio'}
            />
            <footer className="handbook-source">
              Fonte: {sourceLabel(lesson.refs)}. Os números de equação e as
              referências a páginas foram preservados das apostilas.{' '}
              {university
                ? 'Texto, demonstrações, exemplos, problemas comentados e figuras preservados da coleção. A capa e o sumário foram substituídos pela navegação do semestre.'
                : course.trackId === 'ensino-medio'
                  ? 'As ampliações conceituais são identificadas separadamente. Os exemplos originais estão disponíveis em blocos expansíveis.'
                  : 'Material independente de preparação, sem vínculo oficial com a TBF ou a IPhO.'}
            </footer>
            <div className="handbook-actions">
              {user ? (
                <button
                  className="btn primary"
                  onClick={() => completeLesson(id)}
                >
                  {university
                    ? completed
                      ? 'Leitura concluída ✓'
                      : 'Concluir leitura'
                    : completed
                      ? 'Aula concluída ✓'
                      : 'Concluir aula'}
                </button>
              ) : (
                <p className="handbook-small">
                  Entre na sua conta para registrar a conclusão desta aula.
                </p>
              )}
              {worksheetPath(course.id, course.trackId) && (
                <button
                  className="btn"
                  onClick={() =>
                    openSheet(
                      course.id,
                      lesson.topicId === 'consulta'
                        ? undefined
                        : lesson.topicId,
                    )
                  }
                >
                  Ficha de {course.area}
                </button>
              )}
            </div>
          </article>
          {questions.length > 0 && (
            <section
              className="handbook-exercises"
              aria-label="Exercícios desta aula"
            >
              <h2>Treino desta aula</h2>
              <p>
                Problemas completos da ficha. Tente uma resolução antes de
                consultar os passos comentados.
              </p>
              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  response={progress.responses[question.id]}
                  onAnswer={answerQuestion}
                />
              ))}
            </section>
          )}
          <nav
            className="handbook-pagination"
            aria-label="Navegação entre aulas"
          >
            {previous ? (
              <button className="btn" onClick={() => openLesson(previous.id)}>
                ←{' '}
                {university && previous.sourceLesson !== lesson.sourceLesson
                  ? `Aula ${String(previous.sourceLesson).padStart(2, '0')} · `
                  : ''}
                {previous.title}
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button className="btn" onClick={() => openLesson(next.id)}>
                {university && next.sourceLesson !== lesson.sourceLesson
                  ? `Aula ${String(next.sourceLesson).padStart(2, '0')} · `
                  : ''}
                {next.title} →
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}
