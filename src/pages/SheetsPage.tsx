import { useState } from 'react'
import { questionsForTrack } from '../../content/catalog'
import { trackById } from '../../content/tracks'
import { useApp } from '../app/context'
import { QuestionCard } from '../components/questions/QuestionCard'
export function SheetsPage() {
  const { route, progress, answerQuestion } = useApp()
  const questionBank = questionsForTrack(route.trackId)
  const [topic, setTopic] = useState('Todos')
  const [difficulty, setDifficulty] = useState('Todas')
  const [objective, setObjective] = useState('Todos')
  const topics = [
    'Todos',
    ...new Set(questionBank.map((question) => question.topic)),
  ]
  const objectives = [
    'Todos',
    ...new Set(questionBank.map((question) => question.objective)),
  ]
  const filtered = questionBank.filter(
    (q) =>
      (topic === 'Todos' || q.topic === topic) &&
      (difficulty === 'Todas' || q.difficulty === difficulty) &&
      (objective === 'Todos' || q.objective === objective),
  )
  return (
    <section className="screen active">
      <div className="sheet-head">
        <div className="eyebrow">prática orientada</div>
        <h1>Fichas de questões</h1>
        <p className="quiet">{trackById(route.trackId).title}</p>
        <p>
          Problemas selecionados para testar modelagem, interpretação e domínio
          dos conceitos.
        </p>
      </div>
      <div className="sheet-tools">
        <select
          className="select"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {topics.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className="select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Todas</option>
          <option value="easy">Fácil</option>
          <option value="medium">Média</option>
          <option value="hard">Difícil</option>
        </select>
        <select
          className="select"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        >
          {objectives.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <span className="quiet">{filtered.length} questões nesta ficha</span>
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
          <strong>
            {questionBank.length
              ? 'Nenhuma questão encontrada.'
              : 'Conteúdo em preparação.'}
          </strong>
          {questionBank.length
            ? 'Escolha outros filtros.'
            : 'Novas questões deste percurso aparecerão aqui.'}
        </div>
      )}
    </section>
  )
}
