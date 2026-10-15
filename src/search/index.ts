import { coursesForTrack, questionsForTrack } from '../../content/catalog'
import type { TrackId } from '../app/types'
import { labs } from '../../simulations/registry'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const matches = (haystack: string, term: string) => {
  const words = normalize(term)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1)
  const text = normalize(haystack)
  return words.length > 0 && words.every((word) => text.includes(word))
}

export function searchContent(term: string, trackId: TrackId = 'ensino-medio') {
  const query = term.trim()
  return {
    lessons: coursesForTrack(trackId)
      .flatMap((course) => course.units.flatMap((unit) => unit.lessons))
      .filter((lesson) =>
        matches(`${lesson.title} ${lesson.description}`, query),
      ),
    questions: questionsForTrack(trackId).filter((question) =>
      matches(
        `${question.topic} ${question.objective} ${question.prompt}`,
        query,
      ),
    ),
    labs: labs.filter((lab) =>
      matches(`${lab.title} ${lab.description}`, query),
    ),
  }
}
