import lessonManifest from './lessons.json'
import { resolveLessonId } from '../../lesson-compatibility'
import questionManifest from './questions.json'
import type { Course, WrittenQuestion } from '../../../src/app/types'
import type { HandbookLesson } from '../../../src/app/handbook'

export const waveLessons = lessonManifest as (HandbookLesson & {
  pages: number
  previousIds: string[]
})[]
export const waveQuestions = questionManifest as WrittenQuestion[]
export const waveCourse: Course = {
  id: 'olympiad-waves',
  trackId: 'olimpiadas',
  title: 'Ondulatória — treinamento TBF / IPhO',
  area: 'Ondulatória',
  level: 'Olimpíadas',
  tone: 'amber',
  description:
    'Propagação, superposição e condições de contorno. Da equação de onda à difração, com deduções completas e 20 problemas resolvidos.',
  units: [...new Set(waveLessons.map((lesson) => lesson.unit))].map(
    (title) => ({
      title,
      lessons: waveLessons
        .filter((lesson) => lesson.unit === title)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: 'Aula',
          minutes: lesson.minutes,
          pages: lesson.pages,
          ...(lesson.estimatedPages ? { estimatedPages: true } : {}),
        })),
    }),
  ),
}

export const waveLessonById = (id: string) =>
  waveLessons.find((lesson) => lesson.id === resolveLessonId(id))
