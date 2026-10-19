import { topics as electricityTopics } from './ensino-medio/eletricidade'
import { topics as wavesTopics } from './ensino-medio/mhs-ondas'
import { topics as opticsTopics } from './ensino-medio/optica'
import { topics as thermoTopics } from './ensino-medio/termologia'
import { mechanicsTopics } from './ensino-medio/mecanica'
import { courseById } from './courses'
import type { CourseId, TrackId } from '../src/app/types'

export const worksheets: Array<{
  id: CourseId
  slug: string
  title: string
  description: string
  guideLessonId: string
  topics?: Array<{ id: string; title: string; description: string }>
  answersLessonId?: string
}> = [
  {
    id: 'mechanics',
    slug: 'mecanica',
    title: 'Ficha de Mecânica',
    description:
      '90 questões integrais, separadas por tema e subtema, com resultados e caminhos de resolução.',
    guideLessonId: 'hs-mech-treino',
    topics: mechanicsTopics.filter((topic) => topic.id !== 'consulta'),
  },
  {
    id: 'electricity',
    slug: 'eletricidade',
    title: 'Ficha de Eletricidade e eletromagnetismo',
    description:
      '30 questões integrais por assunto: 18 fáceis, 8 intermediárias e 4 difíceis, com enunciados, figuras e soluções detalhadas.',
    guideLessonId: 'hs-elec-treino',
    answersLessonId: 'hs-elec-gabarito-1',
    topics: electricityTopics.filter((topic) => topic.id !== 'consulta'),
  },
  {
    id: 'waves',
    slug: 'mhs-ondas',
    title: 'Ficha de Ondas e oscilações',
    description:
      '30 questões integrais por assunto: 18 fáceis, 8 intermediárias e 4 difíceis, com enunciados, figuras e soluções detalhadas.',
    guideLessonId: 'hs-mhs-treino',
    answersLessonId: 'hs-mhs-gabarito-1',
    topics: wavesTopics.filter((topic) => topic.id !== 'consulta'),
  },
  {
    id: 'optics',
    slug: 'optica',
    title: 'Ficha de Óptica',
    description:
      '30 questões integrais por assunto: 18 fáceis, 8 intermediárias e 4 difíceis, com enunciados, figuras e soluções detalhadas.',
    guideLessonId: 'hs-opt-treino',
    answersLessonId: 'hs-opt-gabarito-1',
    topics: opticsTopics.filter((topic) => topic.id !== 'consulta'),
  },
  {
    id: 'thermo',
    slug: 'termologia',
    title: 'Ficha de Termologia e termodinâmica',
    description:
      '30 questões integrais por assunto: 18 fáceis, 8 intermediárias e 4 difíceis, com enunciados, figuras e soluções detalhadas.',
    guideLessonId: 'hs-term-treino',
    answersLessonId: 'hs-term-gabarito-1',
    topics: thermoTopics.filter((topic) => topic.id !== 'consulta'),
  },

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
