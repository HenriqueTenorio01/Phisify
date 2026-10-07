import type { Question, StoredResponse } from '../../app/types'

export function QuestionCard({ question, response, onAnswer }: { question: Question; response?: StoredResponse | undefined; onAnswer: (question: Question, selected: number) => void | Promise<void> }) {
  return <article className="question"><div className="question-top"><span className="question-id">{question.topic} · {question.format}</span><span className={`difficulty ${question.difficulty}`}>{question.difficulty === 'easy' ? 'fácil' : question.difficulty === 'medium' ? 'média' : 'difícil'}</span></div><h3>{question.prompt}</h3><div className="question-options">{question.options.map((option, index) => <button key={option} className={`question-option ${response ? (index === question.answer ? 'correct' : index === response.selected ? 'wrong' : '') : ''}`} onClick={() => onAnswer(question, index)} aria-pressed={response?.selected === index}>{option}</button>)}</div>{response && <div className={`question-feedback ${response.correct ? 'good' : 'bad'}`}><strong>{response.correct ? 'Correto.' : 'Ainda não.'}</strong> {question.explanation}</div>}<div className="question-reasoning">Estratégia: {question.reasoning}</div></article>
}


