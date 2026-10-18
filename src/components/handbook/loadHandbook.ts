import { loadUniversityReader } from '../../../content/universidade/semestre-1/reader'
import type { CourseId } from '../../app/types'

type Reader = typeof import('../../../content/olimpiadas/ondas/reader')
const readers = new Map<string, Promise<Reader>>()

// React's use() needs a stable promise across Suspense retries.
export function loadHandbook(
  id: CourseId,
  sourceLesson?: number,
): Promise<Reader> {
  const key = `${id}:${sourceLesson ?? ''}`
  const existing = readers.get(key)
  if (existing) return existing
  const reader =
    id === 'university-mechanics-1'
      ? loadUniversityReader(sourceLesson ?? 1)
      : id === 'mechanics'
        ? import('../../../content/ensino-medio/mecanica/reader')
        : id === 'olympiad-waves'
          ? import('../../../content/olimpiadas/ondas/reader')
          : id === 'olympiad-gravity'
            ? import('../../../content/olimpiadas/gravitacao/reader')
            : id === 'olympiad-center-of-mass'
              ? import('../../../content/olimpiadas/centro-de-massa/reader')
              : null
  if (!reader) throw new Error(`Apostila indisponível: ${id}`)
  readers.set(key, reader)
  return reader
}
