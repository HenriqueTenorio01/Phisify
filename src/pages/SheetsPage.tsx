import { useState } from 'react'
import { courseById, lessonById } from '../../content/courses'
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
  const topic = sheet?.topics?.find((item) => item.id === route.topicId)
  const showQuestions =
    !sheet?.topics || Boolean(topic) || route.topicId === 'todos'
  const topicBank = topic
    ? questionBank.filter((q) => q.topicId === topic.id)
    : questionBank
  const [subtopic, setSubtopic] = useState('Todos')
  const subtopics = [
    ...new Set(
      topicBank
        .map((q) => q.subtopic)
        .filter((item): item is string => Boolean(item)),
    ),
  ]
  const [difficulty, setDifficulty] = useState('Todas')
  const [objective, setObjective] = useState('Todos')
  const objectives = ['Todos', ...new Set(topicBank.map((q) => q.objective))]
  const filtered = topicBank.filter(
    (q) =>
      (difficulty === 'Todas' || q.difficulty === difficulty) &&
      (objective === 'Todos' || q.objective === objective) &&
      (subtopic === 'Todos' || q.subtopic === subtopic),
  )
  return (
    <section className="screen active">
      <div className="sheet-head">
        <div className="eyebrow">prática orientada</div>
        <h1>
          {sheet?.title ?? 'Fichas de questões'}
          {topic ? ` · ${topic.title}` : ''}
        </h1>
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
              onClick={() => openCourse(sheet.id, topic?.id)}
            >
              Aulas de{' '}
              {topic?.title ??
                courseById(sheet.id)?.area ??
                questionBank[0]?.topic}
            </button>
          </div>
          {sheet.topics && (
            <>
              <div className="sheet-links">
                <button
                  className="link-button"
                  onClick={() => openSheet(sheet.id)}
                >
                  Escolher tema
                </button>
                <button
                  className="link-button"
                  onClick={() => openSheet(sheet.id, 'todos')}
                >
                  Ver as {questionBank.length} questões
                </button>
              </div>
              {!showQuestions && (
                <div className="sheet-catalog">
                  {sheet.topics.map((item) => (
                    <article className="sheet-catalog-card" key={item.id}>
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                      <p className="quiet">
                        {
                          questionBank.filter((q) => q.topicId === item.id)
                            .length
                        }{' '}
                        questões com soluções detalhadas
                      </p>
                      <div className="sheet-links">
                        <button
                          className="btn primary"
                          onClick={() => openSheet(sheet.id, item.id)}
                        >
                          Questões de {item.title}
                        </button>
                        <button
                          className="btn"
                          onClick={() => openCourse(sheet.id, item.id)}
                        >
                          Aulas de {item.title}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {showQuestions && (
            <>
              <p className="quiet">
                {topicBank.length} problemas discursivos. Resolva antes de abrir
                a solução; a autoavaliação é registrada na sua conta.
              </p>
              <div className="sheet-tools">
                {subtopics.length > 0 && (
                  <select
                    className="select"
                    aria-label="Subtema"
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                  >
                    <option value="Todos">Todos os subtemas</option>
                    {subtopics.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                )}
                <select
                  className="select"
                  aria-label="Dificuldade"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Todas">Todas as dificuldades</option>
                  <option value="easy">
                    {sheet.id === 'mechanics' ? 'Básica' : 'Fácil'}
                  </option>
                  <option value="medium">Intermediária</option>
                  <option value="hard">
                    {sheet.id === 'mechanics' ? 'Integração' : 'Difícil'}
                  </option>
                </select>
                {!sheet.topics && (
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
                )}
                <span className="quiet">
                  {filtered.length} questões nesta seleção
                </span>
              </div>
              <div className="question-list">
                {filtered.map((question) => (
                  <div key={question.id} className="sheet-question">
                    {courseById(question.course)?.separatePractice && (
                      <nav
                        className="school-question-reading"
                        aria-label={`Teoria da questão ${question.kind === 'written' ? question.sourceNumber : ''}`}
                      >
                        <strong>Rever a teoria:</strong>
                        {[
                          question.lessonId,
                          ...(question.kind === 'written'
                            ? (question.relatedLessonIds ?? [])
                            : []),
                        ].map((id) => (
                          <button
                            key={id}
                            className="link-button"
                            onClick={() => openLesson(id)}
                          >
                            {lessonById(id)?.data.title}
                          </button>
                        ))}
                      </nav>
                    )}
                    <QuestionCard
                      question={question}
                      response={progress.responses[question.id]}
                      onAnswer={answerQuestion}
                    />
                  </div>
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">
                  <strong>Nenhuma questão encontrada.</strong>Escolha outros
                  filtros.
                </div>
              )}
            </>
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
                <div className="eyebrow">{trackById(route.trackId).title}</div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p className="quiet">
                  {items.length} questões ·{' '}
                  {items.filter((q) => q.difficulty === 'easy').length}{' '}
                  {item.id === 'mechanics' ? 'básicas' : 'fáceis'} ·{' '}
                  {items.filter((q) => q.difficulty === 'medium').length}{' '}
                  intermediárias ·{' '}
                  {items.filter((q) => q.difficulty === 'hard').length}{' '}
                  {item.id === 'mechanics' ? 'de integração' : 'difíceis'}
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
