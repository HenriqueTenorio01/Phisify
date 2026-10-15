import { waveQuestions } from './olimpiadas/ondas'
import { gravityQuestions } from './olimpiadas/gravitacao'
import { centerOfMassQuestions } from './olimpiadas/centro-de-massa'
import type { Question } from '../src/app/types'

// The old Ensino Médio questions remain retired. Each course supplies its own catalog.
export const questionBank: Question[] = [
  ...waveQuestions,
  ...gravityQuestions,
  ...centerOfMassQuestions,
]

export function questionById(id: string) {
  return questionBank.find((question) => question.id === id)
}
