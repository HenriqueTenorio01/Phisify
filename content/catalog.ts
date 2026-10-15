import { courses } from './courses'
import { questionBank } from './questions'
import type { ProgressState, TrackId } from '../src/app/types'

export function coursesForTrack(trackId: TrackId) {
  return courses.filter((course) => course.trackId === trackId)
}

export function questionsForTrack(trackId: TrackId) {
  const ids = new Set(coursesForTrack(trackId).map((course) => course.id))
  return questionBank.filter((question) => ids.has(question.course))
}

// Keep stored history intact, but only show progress for published content in this track.
export function progressForTrack(
  progress: ProgressState,
  trackId: TrackId,
): ProgressState {
  const lessons = new Set(
    coursesForTrack(trackId).flatMap((course) =>
      course.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
    ),
  )
  const questions = new Set(
    questionsForTrack(trackId).map((question) => question.id),
  )
  return {
    ...progress,
    completedLessons: progress.completedLessons.filter((id) => lessons.has(id)),
    responses: Object.fromEntries(
      Object.entries(progress.responses).filter(([id]) => questions.has(id)),
    ),
    history: progress.history.filter(
      (item) =>
        item.contentId &&
        (item.type === 'lesson' ? lessons : questions).has(item.contentId),
    ),
  }
}
