import type { AcademicLesson, LessonData } from '../src/app/types'

// Current Ensino Médio lessons have been retired. Keep registries for new content.
export const lessonDataById: Record<string, LessonData> = {}
export const academicLessons: Record<string, AcademicLesson> = {}

export function academicLessonById(id: string) {
  return academicLessons[id]
}
