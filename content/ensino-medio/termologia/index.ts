import lessonManifest from './lessons.json'
import questionManifest from './questions.json'
import topicManifest from './topics.json'
import type { WrittenQuestion } from '../../../src/app/types'
import type { HandbookLesson } from '../../../src/app/handbook'
import { createSchoolCourse } from '../create-course'

export const lessons = lessonManifest as HandbookLesson[]
export const questions = questionManifest as WrittenQuestion[]
export const topics = topicManifest
export const course = createSchoolCourse(
  {
    id: 'thermo',
    title: 'Termologia e termodinâmica',
    area: 'Termologia',
    tone: 'blue',
  },
  lessons,
  topics,
)
