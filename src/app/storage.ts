import type { ProgressState, Screen } from './types'

export const STORAGE_KEY = 'phisify-platform-v1'

function getStorageKey(userId?: string) {
  return userId ? `${STORAGE_KEY}:${userId}` : `${STORAGE_KEY}:guest`
}

export const emptyProgress = (): ProgressState => ({
  completedLessons: [],
  responses: {},
  history: [],
  lastScreen: 'home',
})

export function loadProgress(userId?: string): ProgressState {
  if (!userId) return emptyProgress()
  if (typeof window === 'undefined') return emptyProgress()
  try {
    const raw = window.localStorage.getItem(getStorageKey(userId))
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      responses: parsed.responses ?? {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      lastScreen: parsed.lastScreen ?? 'home',
    }
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: ProgressState, userId?: string) {
  if (typeof window === 'undefined' || !userId) return
  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(progress))
  } catch {
    /* local storage is optional */
  }
}

export function screenFrom(value: string | null): Screen {
  const valid: Screen[] = [
    'home', 'courses', 'lab', 'sheets', 'performance', 'review', 'search',
    'course', 'lesson', 'simulation', 'login', 'signup', 'recovery',
    'profile', 'settings',
  ]
  return value && valid.includes(value as Screen) ? value as Screen : 'home'
}


