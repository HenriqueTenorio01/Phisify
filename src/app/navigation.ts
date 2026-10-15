import { tracks } from '../../content/tracks'
import { worksheetsForTrack } from '../../content/worksheets'
import { resolveLessonId } from '../../content/lesson-compatibility'
import type { RouteState, Screen, TrackId } from './types'

const trackScreens: Partial<Record<Screen, string>> = {
  courses: '',
  sheets: '/questoes',
  review: '/revisao',
  performance: '/desempenho',
  search: '/busca',
}
const paths: Partial<Record<Screen, string>> = {
  home: '/',
  lab: '/laboratorio',
  login: '/login',
  signup: '/cadastro',
  recovery: '/recuperar-senha',
  profile: '/perfil',
  settings: '/configuracoes',
}

export function screenPath(screen: Screen, trackId: TrackId) {
  return screen in trackScreens
    ? `/trilhas/${trackId}${trackScreens[screen]}`
    : paths[screen]
}

export function routeFromLocation(
  pathname: string,
  search = '',
): Partial<RouteState> | null {
  const topicId = new URLSearchParams(search).get('tema')
  const path = pathname.replace(/\/+$/, '') || '/'
  if (new URLSearchParams(search).get('auth') === 'recovery')
    return { screen: 'recovery' }
  const match = /^\/trilhas\/([^/]+)(?:\/(.*))?$/.exec(path)
  const track = tracks.find((item) => item.id === match?.[1])
  if (track) {
    const rest = match?.[2] ?? ''
    const screen = Object.entries(trackScreens).find(
      ([, suffix]) => suffix === (rest ? `/${rest}` : ''),
    )?.[0] as Screen | undefined
    if (screen)
      return { screen, trackId: track.id, sheetId: null, topicId: null }
    if (rest.startsWith('questoes/')) {
      const sheet = worksheetsForTrack(track.id).find(
        (item) => item.slug === rest.slice(9),
      )
      // Preserve the requested screen for a useful unavailable-sheet message.
      return {
        screen: 'sheets',
        trackId: track.id,
        sheetId: sheet?.id ?? 'unavailable',
        topicId,
      }
    }
    if (rest.startsWith('cursos/'))
      return {
        screen: 'course',
        trackId: track.id,
        courseId: rest.slice(7) as RouteState['courseId'],
        topicId,
      }
    if (rest.startsWith('aulas/'))
      return {
        screen: 'lesson',
        trackId: track.id,
        lessonId: resolveLessonId(rest.slice(6)),
        topicId: null,
      }
    return null
  }
  const screen = Object.entries(paths).find(
    ([, value]) => value === path,
  )?.[0] as Screen | undefined
  if (screen) return { screen }
  const labs = {
    '/laboratorio/lancamento-obliquo': 'projectile',
    '/laboratorio/interferencia-de-ondas': 'waves',
    '/laboratorio/circuito-resistivo': 'circuit',
  } as const
  const labId = labs[path as keyof typeof labs]
  return labId ? { screen: 'simulation', labId } : null
}
