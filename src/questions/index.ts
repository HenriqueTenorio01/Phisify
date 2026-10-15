export { questionBank, questionById } from '../../content/questions'

import type { Question } from '../app/types'

/** Written responses are explicit self-assessments, never automatic grading. */
export function isResponseCorrect(question: Question, selected: number) {
  return question.kind === 'written'
    ? selected === 1
    : selected === question.answer
}
