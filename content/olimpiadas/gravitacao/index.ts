import lessonManifest from './lessons.json'
import questionManifest from './questions.json'
import type { Course, WrittenQuestion } from '../../../src/app/types'
import type { HandbookLesson } from '../../../src/app/handbook'

export const gravityLessons = lessonManifest as HandbookLesson[]
export const gravityQuestions = questionManifest as WrittenQuestion[]
export const gravityCourse: Course = {
  id: 'olympiad-gravity',
  trackId: 'olimpiadas',
  title: 'Gravitação — treinamento TBF / IPhO',
  area: 'Gravitação',
  level: 'Olimpíadas',
  tone: 'blue',
  description:
    'Do campo gravitacional à geometria e ao tempo das órbitas. Dois corpos, Binet, manobras, espalhamento e marés, com deduções completas e 20 problemas resolvidos.',
  units: [...new Set(gravityLessons.map((lesson) => lesson.unit))].map(
    (title) => ({
      title,
      lessons: gravityLessons
        .filter((lesson) => lesson.unit === title)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: 'Aula',
          minutes: lesson.minutes,
        })),
    }),
  ),
}

export const gravityLessonById = (id: string) =>
  gravityLessons.find((lesson) => lesson.id === id)
