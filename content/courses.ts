import { course as electricityCourse } from './ensino-medio/eletricidade'
import { course as wavesCourse } from './ensino-medio/mhs-ondas'
import { course as opticsCourse } from './ensino-medio/optica'
import { course as thermoCourse } from './ensino-medio/termologia'
import { universityCourse } from './universidade/semestre-1'
import { mechanicsCourse } from './ensino-medio/mecanica'
import { waveCourse } from './olimpiadas/ondas'
import { gravityCourse } from './olimpiadas/gravitacao'
import { centerOfMassCourse } from './olimpiadas/centro-de-massa'
import { resolveLessonId } from './lesson-compatibility'
import type { Course } from '../src/app/types'

export const courses: Course[] = [
  universityCourse,
  waveCourse,
  gravityCourse,
  centerOfMassCourse,
  mechanicsCourse,
  electricityCourse,
  wavesCourse,
  opticsCourse,
  thermoCourse,
]

export function courseById(id: string) {
  return courses.find((course) => course.id === id)
}
export function lessonById(id: string) {
  const canonical = resolveLessonId(id)
  for (const course of courses)
    for (const unit of course.units) {
      const lesson = unit.lessons.find((item) => item.id === canonical)
      if (lesson) return { course, unit, data: lesson }
    }
  return null
}
