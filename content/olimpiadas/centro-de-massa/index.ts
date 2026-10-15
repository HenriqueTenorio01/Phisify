import lessonManifest from './lessons.json'
import questionManifest from './questions.json'
import type { Course, WrittenQuestion } from '../../../src/app/types'
import type { HandbookLesson } from '../../../src/app/handbook'

export const centerOfMassLessons = lessonManifest as (HandbookLesson & {
  pages: number
})[]
export const centerOfMassQuestions = questionManifest as WrittenQuestion[]
export const centerOfMassCourse: Course = {
  id: 'olympiad-center-of-mass',
  trackId: 'olimpiadas',
  title: 'Centro de Massa — treinamento TBF / IPhO',
  area: 'Centro de Massa',
  level: 'Olimpíadas',
  tone: 'green',
  compact: true,
  description:
    'Do primeiro momento de massa aos vínculos móveis. König, rotação, massa reduzida, cunhas, pêndulos e sistemas abertos, com deduções completas e 14 problemas resolvidos.',
  units: [...new Set(centerOfMassLessons.map((lesson) => lesson.unit))].map(
    (title) => ({
      title,
      lessons: centerOfMassLessons
        .filter((lesson) => lesson.unit === title)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: 'Aula',
          minutes: lesson.minutes,
          pages: lesson.pages,
        })),
    }),
  ),
}
