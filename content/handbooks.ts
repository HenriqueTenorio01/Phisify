import {
  course as electricityCourse,
  lessons as electricityLessons,
} from './ensino-medio/eletricidade'
import {
  course as wavesCourse,
  lessons as wavesLessons,
} from './ensino-medio/mhs-ondas'
import {
  course as opticsCourse,
  lessons as opticsLessons,
} from './ensino-medio/optica'
import {
  course as thermoCourse,
  lessons as thermoLessons,
} from './ensino-medio/termologia'
import { universityCourse, universityLessons } from './universidade/semestre-1'
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
  { course: electricityCourse, lessons: electricityLessons },
  { course: wavesCourse, lessons: wavesLessons },
  { course: opticsCourse, lessons: opticsLessons },
  { course: thermoCourse, lessons: thermoLessons },

  { course: universityCourse, lessons: universityLessons },
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
