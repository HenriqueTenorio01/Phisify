import waves from './olimpiadas/ondas/lessons.json'
import gravity from './olimpiadas/gravitacao/lessons.json'

// Small metadata only. Historical IDs remain in storage; no account data is
// rewritten when loading the reorganized catalog.
const groups = [...waves, ...gravity]
const aliases = new Map(
  groups.flatMap((lesson) =>
    lesson.previousIds.map((id) => [id, lesson.id] as const),
  ),
)
const parts = new Map(groups.map((lesson) => [lesson.id, lesson.previousIds]))

export function resolveLessonId(id: string) {
  return aliases.get(id) ?? id
}

export function completionIdsForLesson(id: string): readonly string[] {
  const canonical = resolveLessonId(id)
  return parts.get(canonical) ?? [canonical]
}

export function lessonCompletion(completedIds: string[], id: string) {
  const saved = new Set(completedIds)
  const required = completionIdsForLesson(id)
  return {
    completed: required.filter((part) => saved.has(part)).length,
    total: required.length,
  }
}
