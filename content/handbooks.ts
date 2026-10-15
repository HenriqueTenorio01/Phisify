import { waveCourse, waveLessons } from './olimpiadas/ondas'
import { gravityCourse, gravityLessons } from './olimpiadas/gravitacao'

// Metadata only: the large source readers load when a lesson or sheet is opened.
export const handbooks = [
  { course: waveCourse, lessons: waveLessons },
  { course: gravityCourse, lessons: gravityLessons },
]

export function handbookForLesson(id: string) {
  return handbooks.find((book) =>
    book.lessons.some((lesson) => lesson.id === id),
  )
}
