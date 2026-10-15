import { useState } from 'react'
import { questionsForTrack } from '../../content/catalog'
import { tracks, trackById } from '../../content/tracks'
import { worksheetsForTrack } from '../../content/worksheets'
import { useApp } from '../app/context'
import { QuestionCard } from '../components/questions/QuestionCard'

export function SheetsPage() {
  const {
    route,
    progress,
    answerQuestion,
    navigate,
    openSheet,
    openLesson,
    openCourse,
  } = useApp()
  const sheets = worksheetsForTrack(route.trackId)
  const sheet = sheets.find((item) => item.id === route.sheetId)
  const questions = questionsForTrack(route.trackId)
  const questionBank = sheet
    ? questions.filter((q) => q.course === sheet.id)
    : []
  const [difficulty, setDifficulty] = useState('Todas')
  const [objective, setObjective] = useState('Todos')
  const objectives = ['Todos', ...new Set(questionBank.map((q) => q.objective))]
  const filtered = questionBank.filter(
    (q) =>
      (difficulty === 'Todas' || q.difficulty === difficulty) &&
      (objective === 'Todos' || q.objective === objective),
  )
  return (
    <section className="screen active">
      <div className="sheet-head">
        <div className="eyebrow">prática orientada</div>
        <h1>{sheet?.title ?? 'Fichas de questões'}</h1>
        <p className="quiet">{trackById(route.trackId).title}</p>
        <p>
          {sheet?.description ??
            'Escolha uma ficha para estudar os problemas e consultar as soluções detalhadas.'}
        </p>
      </div>
      <nav className="sheet-tracks" aria-label="Trilhas das fichas">
        {tracks.map((track) => (
          <button
            key={track.id}
            className={`btn ${track.id === route.trackId ? 'primary' : ''}`}
            aria-current={track.id === route.trackId ? 'page' : undefined}
            onClick={() => navigate('sheets', track.id)}
          >
            {track.title}
          </button>
        ))}
      </nav>
      {sheet ? (
        <>
          <div className="sheet-links">
            <button className="link-button" onClick={() => navigate('sheets')}>
              ← Todas as fichas desta trilha
            </button>
            <button
              className="link-button"
              onClick={() => openLesson(sheet.guideLessonId)}
            >
              Orientações e convenções
            </button>
            {sheet.answersLessonId && (
              <button
                className="link-button"
                onClick={() => openLesson(sheet.answersLessonId!)}
              >
                Gabarito para conferência
              </button>
            )}
            <button
              className="link-button"
              onClick={() => openCourse(sheet.id)}
            >
              Aulas de {questionBank[0]?.topic}
            </button>
          </div>
          <p className="quiet">
            {questionBank.length} problemas discursivos. Resolva antes de abrir
            a solução; a autoavaliação é registrada na sua conta.
          </p>
          <div className="sheet-tools">
            <select
              className="select"
              aria-label="Dificuldade"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Todas">Todas as dificuldades</option>
              <option value="easy">Fácil</option>
              <option value="medium">Intermediária</option>
              <option value="hard">Difícil</option>
            </select>
            <select
              className="select"
              aria-label="Objetivo"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            >
              {objectives.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <span className="quiet">
              {filtered.length} questões nesta seleção
            </span>
          </div>
          <div className="question-list">
            {filtered.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                response={progress.responses[question.id]}
                onAnswer={answerQuestion}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty">
              <strong>Nenhuma questão encontrada.</strong>Escolha outros
              filtros.
            </div>
          )}
        </>
      ) : route.sheetId ? (
        <div className="empty">
          <strong>Ficha indisponível neste percurso.</strong>
          <button className="btn" onClick={() => navigate('sheets')}>
            Ver fichas desta trilha
          </button>
        </div>
      ) : sheets.length ? (
        <div className="sheet-catalog">
          {sheets.map((item) => {
            const items = questions.filter((q) => q.course === item.id)
            return (
              <article className="sheet-catalog-card" key={item.id}>
                <div className="eyebrow">TBF / IPhO · Olimpíadas</div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p className="quiet">
                  {items.length} questões ·{' '}
                  {items.filter((q) => q.difficulty === 'easy').length} fáceis ·{' '}
                  {items.filter((q) => q.difficulty === 'medium').length}{' '}
                  intermediárias ·{' '}
                  {items.filter((q) => q.difficulty === 'hard').length} difíceis
                </p>
                <button
                  className="btn primary"
                  onClick={() => openSheet(item.id)}
                >
                  Abrir {item.title.toLocaleLowerCase('pt-BR')}
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty">
          <strong>Conteúdo em preparação.</strong>Novas fichas deste percurso
          aparecerão aqui.
        </div>
      )}
    </section>
  )
}
