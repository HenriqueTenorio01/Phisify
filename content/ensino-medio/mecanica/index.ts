import lessonManifest from './lessons.json'
import questionManifest from './questions.json'
import topicManifest from './topics.json'
import type { Course, WrittenQuestion } from '../../../src/app/types'
import type { HandbookLesson } from '../../../src/app/handbook'

export const mechanicsLessons = lessonManifest as (HandbookLesson & {
  pages: number
})[]
export const mechanicsQuestions = questionManifest as WrittenQuestion[]
export const mechanicsTopics = topicManifest
export const mechanicsCourse: Course = {
  id: 'mechanics',
  trackId: 'ensino-medio',
  title: 'Mecânica',
  area: 'Mecânica',
  level: 'Ensino Médio',
  tone: 'blue',
  description:
    'Do significado das medidas ao movimento dos fluidos. Explicações conceituais, deduções, hipóteses de uso e 90 questões completas, organizadas por tema.',
  units: mechanicsTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    lessons: mechanicsLessons
      .filter((lesson) => lesson.topicId === topic.id)
      .map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type:
          lesson.id.includes('formulario') || lesson.topicId === 'consulta'
            ? 'Consulta'
            : 'Aula',
        minutes: lesson.minutes,
        pages: lesson.pages,
        estimatedPages: lesson.estimatedPages ?? false,
      })),
  })),
}
