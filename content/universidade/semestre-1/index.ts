import lessonManifest from './lessons.json'
import aulas from './aulas.json'
import type { Course } from '../../../src/app/types'
import type { HandbookLesson } from '../../../src/app/handbook'

export const universityLessons = lessonManifest as (HandbookLesson & {
  pages: number
  sourceLesson: number
})[]
export const universityAulas = aulas
export const universityCourse: Course = {
  id: 'university-mechanics-1',
  trackId: 'universidade',
  semester: 1,
  title: 'Mecânica I',
  area: 'Mecânica',
  level: 'Universidade · 1º semestre',
  tone: 'blue',
  description:
    'Cinco aulas da coleção universitária, organizadas em leituras por assunto. Cinemática vetorial, Newton, energia, momento linear, centro de massa, momento angular e estática.',
  units: aulas.map((aula) => ({
    id: aula.id,
    sourceNumber: aula.number,
    title: aula.title,
    description: aula.description,
    lessons: universityLessons
      .filter((l) => l.sourceLesson === aula.number)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        type: l.chapter ? 'Leitura' : 'Consulta',
        minutes: l.minutes,
        pages: l.pages,
      })),
  })),
}
