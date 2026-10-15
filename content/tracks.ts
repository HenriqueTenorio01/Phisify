import type { TrackId } from '../src/app/types'

export const tracks: Array<{
  id: TrackId
  title: string
  description: string
}> = [
  {
    id: 'ensino-medio',
    title: 'Ensino Médio',
    description: 'Uma base de física para a escola e os vestibulares.',
  },
  {
    id: 'olimpiadas',
    title: 'Olimpíadas',
    description: 'Um percurso dedicado à preparação para olimpíadas de física.',
  },
  {
    id: 'universidade',
    title: 'Universidade',
    description: 'Um percurso dedicado ao estudo da física no ensino superior.',
  },
]

export function trackById(id: TrackId) {
  return tracks.find((track) => track.id === id)!
}
