import { use, useState } from 'react'
import { courseById } from '../../../content/courses'
import type { WrittenQuestion, StoredResponse } from '../../app/types'
import { useAuth } from '../../hooks/useAuth'
import { HandbookBlocks } from '../handbook/HandbookBlocks'
import { loadHandbook } from '../handbook/loadHandbook'

export default function WrittenQuestionCard({
  question,
  response,
  onAnswer,
}: {
  question: WrittenQuestion
  response?: StoredResponse | undefined
  onAnswer: (
    question: WrittenQuestion,
    selected: number,
  ) => void | Promise<void>
}) {
  const { user } = useAuth()
  const { resolveSource, sourceLabel } = use(loadHandbook(question.course))
  const [draft, setDraft] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function assess(correct: boolean) {
    if (saving || !user) return
    setSaving(true)
    setError('')
    try {
      await onAnswer(question, correct ? 1 : 0)
    } catch {
      setError('Não foi possível registrar a autoavaliação. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <article
      className="question handbook-paper handbook-question"
      aria-label={`Questão ${question.sourceNumber}`}
    >
      <div className="handbook-question-meta">
        <span>{question.objective}</span>
        <span>
          {question.difficultyLabel ??
            (question.difficulty === 'easy'
              ? 'Fácil'
              : question.difficulty === 'medium'
                ? 'Intermediária'
                : 'Difícil')}{' '}
          · Discursiva
        </span>
      </div>
      <HandbookBlocks
        blocks={resolveSource(question.statement)}
        prefix={question.id + '-statement'}
      />
      {question.hints?.length ? (
        <details
          className="handbook-hint"
          onToggle={(event) => setHintRevealed(event.currentTarget.open)}
        >
          <summary>Consultar pista opcional</summary>
          {hintRevealed && (
            <HandbookBlocks
              blocks={resolveSource(question.hints)}
              prefix={question.id + '-hint'}
            />
          )}
        </details>
      ) : null}
      <label className="handbook-workspace">
        Sua tentativa ou notas de resolução
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Resolva no caderno ou registre aqui seu raciocínio antes de consultar a solução."
        />
      </label>
      <p className="handbook-small">
        Estas notas são temporárias. Use seu caderno para guardar a resolução
        completa.
      </p>
      <details
        className="handbook-solution"
        onToggle={(event) => setRevealed(event.currentTarget.open)}
      >
        <summary>Consultar solução detalhada</summary>
        {revealed && (
          <HandbookBlocks
            blocks={resolveSource(question.solution)}
            prefix={question.id + '-solution'}
          />
        )}
      </details>
      <div className="handbook-self-assessment">
        <strong>Autoavaliação após comparar os passos da solução</strong>
        <p>
          A questão é discursiva: o site não corrige automaticamente sua
          demonstração.
        </p>
        {user ? (
          <>
            <div className="handbook-actions">
              <button
                className="btn"
                disabled={!revealed || saving}
                aria-pressed={response?.correct === false}
                onClick={() => assess(false)}
              >
                Preciso revisar
              </button>
              <button
                className="btn primary"
                disabled={!revealed || saving}
                aria-pressed={response?.correct === true}
                onClick={() => assess(true)}
              >
                Resolvi corretamente
              </button>
            </div>
            {response && (
              <p role="status">
                {response.correct
                  ? 'Registrada como resolvida por autoavaliação.'
                  : 'Marcada para revisão.'}
              </p>
            )}
          </>
        ) : (
          <p>
            Entre na sua conta para registrar a autoavaliação. O enunciado e a
            solução estão disponíveis para leitura.
          </p>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
      <footer className="handbook-source">
        Fonte:{' '}
        {sourceLabel([
          ...question.statement,
          ...(question.hints ?? []),
          ...question.solution,
        ])}
        .{' '}
        {courseById(question.course)?.trackId === 'ensino-medio'
          ? `Problema autoral da ficha de ${courseById(question.course)?.area} do Ensino Médio.`
          : 'Problema autoral da ficha de treinamento; não é questão oficial da IPhO.'}
      </footer>
    </article>
  )
}
