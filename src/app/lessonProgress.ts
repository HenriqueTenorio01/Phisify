import {
  completionIdsForLesson,
  resolveLessonId,
} from '../../content/lesson-compatibility'
import type { ProgressState } from './types'

// A completion fills only the missing parts. Responses, other courses and the
// original saved IDs survive both partial and full historical completions.
export function completeLessonProgress(
  progress: ProgressState,
  id: string,
  title: string,
  at: number,
): ProgressState {
  const missing = completionIdsForLesson(id).filter(
    (part) => !progress.completedLessons.includes(part),
  )
  if (!missing.length) return progress
  return {
    ...progress,
    completedLessons: [...progress.completedLessons, ...missing],
    history: [
      {
        label: title,
        type: 'lesson' as const,
        contentId: resolveLessonId(id),
        at,
      },
      ...progress.history,
    ].slice(0, 50),
  }
}
