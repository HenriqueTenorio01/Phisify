import { questions as electricityQuestions } from './ensino-medio/eletricidade'
import { questions as wavesQuestions } from './ensino-medio/mhs-ondas'
import { questions as opticsQuestions } from './ensino-medio/optica'
import { questions as thermoQuestions } from './ensino-medio/termologia'
import { mechanicsQuestions } from './ensino-medio/mecanica'
import { waveQuestions } from './olimpiadas/ondas'
import { gravityQuestions } from './olimpiadas/gravitacao'
import { centerOfMassQuestions } from './olimpiadas/centro-de-massa'
import type { Question } from '../src/app/types'

// The old Ensino Médio questions remain retired. Each course supplies its own catalog.
export const questionBank: Question[] = [
  ...waveQuestions,
  ...gravityQuestions,
  ...centerOfMassQuestions,
  ...mechanicsQuestions,
  ...electricityQuestions,
  ...wavesQuestions,
  ...opticsQuestions,
  ...thermoQuestions,
]

export function questionById(id: string) {
  return questionBank.find((question) => question.id === id)
}
