import type { CourseId } from '../../app/types'

type Reader = typeof import('../../../content/olimpiadas/ondas/reader')
const readers = new Map<CourseId, Promise<Reader>>()

// React's use() needs a stable promise across Suspense retries.
export function loadHandbook(id: CourseId): Promise<Reader> {
  const existing = readers.get(id)
  if (existing) return existing
  const reader =
    id === 'olympiad-waves'
      ? import('../../../content/olimpiadas/ondas/reader')
      : id === 'olympiad-gravity'
        ? import('../../../content/olimpiadas/gravitacao/reader')
        : id === 'olympiad-center-of-mass'
          ? import('../../../content/olimpiadas/centro-de-massa/reader')
          : null
  if (!reader) throw new Error(`Apostila indisponível: ${id}`)
  readers.set(id, reader)
  return reader
}
