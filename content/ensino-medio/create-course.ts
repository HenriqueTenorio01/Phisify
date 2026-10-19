import type { Course } from '../../src/app/types'
import type { HandbookLesson } from '../../src/app/handbook'

export function createSchoolCourse(
  metadata: Pick<Course, 'id' | 'title' | 'area' | 'tone'>,
  lessons: HandbookLesson[],
  topics: Array<{ id: string; title: string; description: string }>,
): Course {
  return {
    ...metadata,
    trackId: 'ensino-medio',
    level: 'Ensino Médio',
    separatePractice: true,
    description:
      'Teoria, deduções e exemplos originais, organizados por assunto. A ficha reúne 30 questões completas com enunciados, figuras e soluções detalhadas.',
    units: topics.map((topic) => ({
      ...topic,
      lessons: lessons
        .filter((lesson) => lesson.topicId === topic.id)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.topicId === 'consulta' ? 'Consulta' : 'Aula',
          minutes: lesson.minutes,
          ...(lesson.pages !== undefined ? { pages: lesson.pages } : {}),
        })),
    })),
  }
}
