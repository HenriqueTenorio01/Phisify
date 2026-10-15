import { courseById } from './courses'
import type { CourseId, TrackId } from '../src/app/types'

export const worksheets: Array<{
  id: CourseId
  slug: string
  title: string
  description: string
  guideLessonId: string
  answersLessonId?: string
}> = [
  {
    id: 'olympiad-waves',
    slug: 'ondulatoria',
    title: 'Ficha de Ondulatória',
    description:
      'Superposição, propagação, modos, acústica, óptica e difração. Enunciados integrais e resoluções comentadas da ficha TBF / IPhO.',
    guideLessonId: 'olymp-waves-treino',
    answersLessonId: 'olymp-waves-gabarito',
  },
  {
    id: 'olympiad-gravity',
    slug: 'gravitacao',
    title: 'Ficha de Gravitação',
    description:
      'Campos, dois corpos, órbitas, manobras, espalhamento e extensões. Enunciados integrais e resoluções comentadas da ficha TBF / IPhO.',
    guideLessonId: 'olymp-gravity-treino',
    answersLessonId: 'olymp-gravity-gabarito',
  },
  {
    id: 'olympiad-center-of-mass',
    slug: 'centro-de-massa',
    title: 'Ficha de Centro de Massa',
    description:
      'Integração, conservação, fragmentação, rotação e vínculos móveis. 14 enunciados integrais, pistas opcionais e resoluções comentadas da ficha TBF / IPhO.',
    guideLessonId: 'olymp-cm-treino',
  },
]

export const worksheetsForTrack = (trackId: TrackId) =>
  worksheets.filter((sheet) => courseById(sheet.id)?.trackId === trackId)

export function worksheetPath(id: CourseId, trackId: TrackId) {
  const sheet = worksheetsForTrack(trackId).find((item) => item.id === id)
  return sheet ? `/trilhas/${trackId}/questoes/${sheet.slug}` : null
}
