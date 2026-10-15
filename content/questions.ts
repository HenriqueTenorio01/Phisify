import type { Question } from '../src/app/types'

// Current Ensino Médio questions have been retired. New content belongs here.
export const questionBank: Question[] = []

export function questionById(id: string) {
  return questionBank.find((question) => question.id === id)
}
