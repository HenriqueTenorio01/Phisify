import { mechanicsCourse, mechanicsLessons } from './ensino-medio/mecanica'
import { waveCourse, waveLessons } from './olimpiadas/ondas'
import { resolveLessonId } from './lesson-compatibility'
import { gravityCourse, gravityLessons } from './olimpiadas/gravitacao'
import {
  centerOfMassCourse,
  centerOfMassLessons,
} from './olimpiadas/centro-de-massa'

// Metadata only: the large source readers load when a lesson or sheet is opened.
export const handbooks = [
  { course: mechanicsCourse, lessons: mechanicsLessons },
  { course: waveCourse, lessons: waveLessons },
  { course: gravityCourse, lessons: gravityLessons },
  { course: centerOfMassCourse, lessons: centerOfMassLessons },
]

export function handbookForLesson(id: string) {
  const canonical = resolveLessonId(id)
  return handbooks.find((book) =>
    book.lessons.some((lesson) => lesson.id === canonical),
  )
}
