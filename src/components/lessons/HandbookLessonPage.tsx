import { useState } from 'react'
import {
  waveCourse,
  waveLessonById,
  waveLessons,
} from '../../../content/olimpiadas/ondas'
import {
  resolveSource,
  sourceLabel,
} from '../../../content/olimpiadas/ondas/reader'
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
    navigate,
  } = useApp()
  const { user } = useAuth()
  const [outlineOpen, setOutlineOpen] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1051px)').matches,
  )
  const lesson = waveLessonById(id)
  if (!lesson) return null
  const blocks = resolveSource(lesson.refs)
  const headings = blocks.filter(
    (block) => block.type === 'heading' && block.level !== 4,
  )
  const index = waveLessons.findIndex((item) => item.id === id)
  const previous = waveLessons[index - 1]
  const next = waveLessons[index + 1]
  const completed = progress.completedLessons.includes(id)
  const questions = questionBank.filter((question) => question.lessonId === id)
  const numberInCourse =
    waveCourse.units
      .flatMap((unit) => unit.lessons)
      .findIndex((item) => item.id === id) + 1
  return (
    <div className="handbook-layout">
      <aside className="handbook-nav">
        <button
          className="link-button"
          onClick={() => openCourse(waveCourse.id)}
        >
          ← Sumário do curso
        </button>
        <p className="handbook-nav-label">Olimpíadas · Ondulatória</p>
        <p>
          {numberInCourse} de {waveLessons.length} aulas
        </p>
        <details
          open={outlineOpen}
          onToggle={(event) => setOutlineOpen(event.currentTarget.open)}
          className="handbook-course-outline"
        >
          <summary>Navegar pelos módulos</summary>
          {waveCourse.units.map((unit) => (
            <div key={unit.title}>
              <strong>{unit.title}</strong>
              {unit.lessons.map((item) => (
                <button
                  key={item.id}
                  className={item.id === id ? 'active' : ''}
                  aria-current={item.id === id ? 'page' : undefined}
                  onClick={() => openLesson(item.id)}
                >
                  {progress.completedLessons.includes(item.id) ? '✓ ' : ''}
                  {item.title}
                </button>
              ))}
            </div>
          ))}
        </details>
      </aside>
      <div className="handbook-reading">
        <article className="handbook-paper">
          <header className="handbook-lesson-header">
            <div className="handbook-kicker">
              Caderno de treinamento · TBF / IPhO
            </div>
            <p className="handbook-unit">{lesson.unit}</p>
            <h1>{lesson.title}</h1>
            <p className="handbook-small">
              Leitura com deduções completas · cerca de {lesson.minutes} min,
              além da resolução dos exercícios.
            </p>
          </header>
          {headings.length > 1 && (
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
          )}
          <HandbookBlocks blocks={blocks} prefix={id} />
          <footer className="handbook-source">
            Fonte: {sourceLabel(lesson.refs)}. Os números de equação e as
            referências a páginas foram preservados das apostilas. Material
            independente de preparação, sem vínculo oficial com a TBF ou a IPhO.
          </footer>
          <div className="handbook-actions">
            {user ? (
              <button
                className="btn primary"
                onClick={() => completeLesson(id)}
              >
                {completed ? 'Aula concluída ✓' : 'Concluir aula'}
              </button>
            ) : (
              <p className="handbook-small">
                Entre na sua conta para registrar a conclusão desta aula.
              </p>
            )}
            <button className="btn" onClick={() => navigate('sheets')}>
              Ficha de Ondulatória
            </button>
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
        <nav className="handbook-pagination" aria-label="Navegação entre aulas">
          {previous ? (
            <button className="btn" onClick={() => openLesson(previous.id)}>
              ← {previous.title}
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button className="btn" onClick={() => openLesson(next.id)}>
              {next.title} →
            </button>
          )}
        </nav>
      </div>
    </div>
  )
}
